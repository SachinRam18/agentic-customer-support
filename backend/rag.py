"""
RAG (Retrieval-Augmented Generation) module — ChromaDB Vector Search.

Uses sentence-transformers (all-MiniLM-L6-v2) to embed user queries and
performs semantic similarity search against the ChromaDB knowledge base
built by backend/ingest_rag.py.

Falls back to the legacy keyword-overlap search if ChromaDB is not yet
initialized (i.e., ingest_rag.py hasn't been run yet).

Public interface (unchanged for agents.py compatibility):
    policy_rag.get_rag_context(message) -> (context_str, sources_list)
"""

import os
import re
import logging
from typing import List, Dict, Any, Tuple, Optional

logger = logging.getLogger("uvicorn.error")

# ─────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")
COLLECTION_NAME = "cloudbox_knowledge"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Number of top-k chunks to retrieve per query
TOP_K = 3

# Minimum similarity distance threshold (ChromaDB uses L2 distance;
# lower = more similar. We reject results above this threshold.)
MAX_DISTANCE = 1.5


# ─────────────────────────────────────────────────────────────
# CHROMADB VECTOR RAG
# ─────────────────────────────────────────────────────────────

class ChromaRAG:
    """
    Semantic RAG using ChromaDB + sentence-transformers embeddings.
    Automatically falls back to keyword search if ChromaDB is unavailable.
    """

    def __init__(self):
        self._collection = None
        self._model = None
        self._fallback = None  # Legacy keyword RAG instance
        self._initialized = False
        self._load()

    def _load(self):
        """
        Attempt to load ChromaDB collection and embedding model.
        Gracefully falls back to keyword search on any failure.
        """
        if not os.path.exists(CHROMA_DIR):
            logger.warning(
                "[ChromaRAG] ChromaDB directory not found at '%s'. "
                "Run 'python backend/ingest_rag.py' to build the index. "
                "Falling back to keyword search.", CHROMA_DIR
            )
            print(
                f"[ChromaRAG] [WARNING] ChromaDB not found. Run 'python backend/ingest_rag.py' first. "
                f"Using keyword fallback.", flush=True
            )
            self._init_fallback()
            return

        try:
            import chromadb
            from sentence_transformers import SentenceTransformer

            logger.info("[ChromaRAG] Loading ChromaDB from '%s'...", CHROMA_DIR)
            chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)

            # Check collection exists
            collections = [c.name for c in chroma_client.list_collections()]
            if COLLECTION_NAME not in collections:
                logger.warning(
                    "[ChromaRAG] Collection '%s' not found in ChromaDB. "
                    "Run ingest_rag.py. Falling back to keyword search.", COLLECTION_NAME
                )
                self._init_fallback()
                return

            self._collection = chroma_client.get_collection(name=COLLECTION_NAME)
            count = self._collection.count()
            logger.info("[ChromaRAG] [OK] Loaded collection '%s' with %d chunks.", COLLECTION_NAME, count)
            print(f"[ChromaRAG] [OK] ChromaDB collection loaded ({count} chunks).", flush=True)

            # Load embedding model
            logger.info("[ChromaRAG] Loading embedding model '%s'...", EMBEDDING_MODEL)
            self._model = SentenceTransformer(EMBEDDING_MODEL)
            logger.info("[ChromaRAG] [OK] Embedding model ready.")
            print(f"[ChromaRAG] [OK] Embedding model '{EMBEDDING_MODEL}' loaded.", flush=True)

            self._initialized = True

        except ImportError as e:
            logger.error(
                "[ChromaRAG] Missing dependency: %s. "
                "Install with: pip install chromadb sentence-transformers. "
                "Falling back to keyword search.", e
            )
            print(f"[ChromaRAG] [WARNING] Missing package: {e}. Using keyword fallback.", flush=True)
            self._init_fallback()

        except Exception as e:
            logger.error(
                "[ChromaRAG] Failed to initialize ChromaDB: %s. "
                "Falling back to keyword search.", e, exc_info=True
            )
            print(f"[ChromaRAG] [WARNING] ChromaDB init error: {e}. Using keyword fallback.", flush=True)
            self._init_fallback()

    def _init_fallback(self):
        """Initialize the legacy keyword-overlap RAG as a fallback."""
        try:
            self._fallback = _KeywordRAG()
            logger.info("[ChromaRAG] Keyword fallback RAG initialized.")
        except Exception as e:
            logger.error("[ChromaRAG] Even fallback RAG failed to init: %s", e)

    # ─── Public API ───

    def get_rag_context(self, message: str) -> Tuple[str, List[str]]:
        """
        Retrieve relevant context for a user query.

        Returns:
            formatted_context (str): Text block to inject into the LLM prompt.
            citations (List[str]): Source labels for UI display.
        """
        if not self._initialized:
            # Use keyword fallback
            if self._fallback:
                return self._fallback.get_rag_context(message)
            return "", []

        return self._vector_search(message)

    # ─── Vector Search ───

    def _vector_search(self, query: str) -> Tuple[str, List[str]]:
        """Embed query and run similarity search against ChromaDB."""
        try:
            query_embedding = self._model.encode([query])[0].tolist()

            results = self._collection.query(
                query_embeddings=[query_embedding],
                n_results=TOP_K,
                include=["documents", "metadatas", "distances"]
            )

            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]

            if not documents:
                logger.debug("[ChromaRAG] No results returned from ChromaDB for query: %s", query)
                return "", []

            # Filter by similarity threshold
            relevant = []
            for doc, meta, dist in zip(documents, metadatas, distances):
                if dist <= MAX_DISTANCE:
                    source_label = self._format_source_label(meta.get("source", "knowledge_base"))
                    relevant.append({
                        "text": doc,
                        "source": source_label,
                        "distance": dist
                    })

            if not relevant:
                logger.debug("[ChromaRAG] All results exceeded distance threshold %.2f.", MAX_DISTANCE)
                return "", []

            # Format context and citations
            context = self._format_context(relevant)
            citations = [r["source"] for r in relevant]

            logger.info(
                "[ChromaRAG] Retrieved %d relevant chunks for query (distances: %s)",
                len(relevant),
                [f"{r['distance']:.3f}" for r in relevant]
            )

            return context, citations

        except Exception as e:
            logger.error("[ChromaRAG] Vector search error: %s. Using fallback.", e, exc_info=True)
            if self._fallback:
                return self._fallback.get_rag_context(query)
            return "", []

    def _format_source_label(self, source: str) -> str:
        """Convert internal source name to a readable label."""
        label_map = {
            "faqs": "CloudBox FAQs",
            "policies": "CloudBox Policy Document",
            "pricing": "CloudBox Pricing & Plans",
        }
        return label_map.get(source, f"CloudBox Knowledge Base ({source})")

    def _format_context(self, results: List[Dict[str, Any]]) -> str:
        """Format retrieved chunks into a structured context string for the LLM prompt."""
        if not results:
            return ""

        lines = ["Here are the most relevant policies, FAQs, and pricing details:\n"]
        for i, r in enumerate(results, 1):
            lines.append(f"[{i}] Source: {r['source']}")
            lines.append(r["text"])
            lines.append("")  # blank line between results

        return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
# LEGACY KEYWORD FALLBACK (kept intact)
# ─────────────────────────────────────────────────────────────

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
    "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
    "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should",
    "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
    "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
    "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
}


class _KeywordRAG:
    """
    Legacy keyword/token-overlap search fallback.
    Used when ChromaDB is not available.
    """

    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self._load_documents()

    def _load_documents(self):
        try:
            from backend.policies import support_faqs, support_policies
        except ImportError:
            try:
                from policies import support_faqs, support_policies
            except ImportError:
                logger.warning("[KeywordRAG] Could not import policies.py. No fallback documents.")
                return

        for faq in support_faqs:
            self.documents.append({
                "id": faq["id"],
                "source": f"FAQ: {faq['question']}",
                "title": faq["question"],
                "text": f"Category: {faq['category']}\nQuestion: {faq['question']}\nAnswer: {faq['answer']}",
                "category": faq["category"]
            })

        for policy in support_policies:
            policy_text = f"Section: {policy['section']}\nTitle: {policy['title']}\n"
            policy_text += "\n".join([f"- {clause}" for clause in policy["content"]])
            self.documents.append({
                "id": policy["id"],
                "source": f"Policy: {policy['section']} - {policy['title']}",
                "title": policy["title"],
                "text": policy_text,
                "category": "Policy"
            })

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b\w+\b', text.lower())
        return [w for w in words if w not in STOPWORDS]

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scored_docs = []
        for doc in self.documents:
            title_tokens = self._tokenize(doc["title"])
            text_tokens = self._tokenize(doc["text"])
            title_matches = sum(1 for t in query_tokens if t in title_tokens)
            text_matches = sum(1 for t in query_tokens if t in text_tokens)
            score = (title_matches * 3.0) + (text_matches * 1.0)
            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_docs[:top_k]]

    def get_rag_context(self, message: str) -> Tuple[str, List[str]]:
        results = self.search(message, top_k=2)
        if not results:
            return "", []

        citations = [doc["source"] for doc in results]
        formatted = "Here are the relevant policies and FAQ answers:\n\n"
        for i, doc in enumerate(results):
            formatted += f"[{i+1}] Source: {doc['source']}\n{doc['text']}\n\n"
        return formatted, citations


# ─────────────────────────────────────────────────────────────
# SINGLETON INSTANCE (drop-in replacement)
# ─────────────────────────────────────────────────────────────

policy_rag = ChromaRAG()
