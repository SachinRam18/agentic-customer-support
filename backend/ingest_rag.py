"""
RAG Ingestion Script for CloudBox Customer Support
====================================================
Reads the .txt knowledge base files, chunks them, embeds with
sentence-transformers (all-MiniLM-L6-v2), and persists to ChromaDB.

Run from the PROJECT ROOT:
    python backend/ingest_rag.py

Re-run anytime to rebuild the index from updated .txt files.
"""

import os
import sys
import time

# Ensure project root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# ─────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_DIR = os.path.join(BASE_DIR, "knowledge_base")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")

# Knowledge base files to ingest
KB_FILES = {
    "faqs": os.path.join(KB_DIR, "faqs.txt"),
    "policies": os.path.join(KB_DIR, "policies.txt"),
    "pricing": os.path.join(KB_DIR, "pricing.txt"),
}

# ChromaDB collection name
COLLECTION_NAME = "cloudbox_knowledge"

# Embedding model
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Chunking parameters
CHUNK_SIZE = 400       # characters per chunk
CHUNK_OVERLAP = 60     # overlap between consecutive chunks


# ─────────────────────────────────────────────────────────────
# TEXT CHUNKING
# ─────────────────────────────────────────────────────────────

def chunk_text(text: str, source_name: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    """
    Split text into overlapping character-level chunks.
    Returns list of (chunk_text, metadata_dict).
    """
    chunks = []
    start = 0
    chunk_index = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if len(chunk) > 30:  # skip very tiny trailing chunks
            chunks.append({
                "text": chunk,
                "source": source_name,
                "chunk_index": chunk_index,
                "id": f"{source_name}_chunk_{chunk_index}"
            })
            chunk_index += 1

        start += chunk_size - overlap  # slide forward with overlap

    return chunks


def chunk_by_sections(text: str, source_name: str, separator: str = "---"):
    """
    Split text by section separator (---) for structured documents.
    Each section becomes its own chunk. Falls back to character chunking
    if sections are too large.
    """
    sections = [s.strip() for s in text.split(separator) if s.strip()]
    all_chunks = []
    chunk_index = 0

    for section in sections:
        if len(section) <= CHUNK_SIZE * 2:
            # Section is reasonably sized — use it as-is
            if len(section) > 30:
                all_chunks.append({
                    "text": section,
                    "source": source_name,
                    "chunk_index": chunk_index,
                    "id": f"{source_name}_chunk_{chunk_index}"
                })
                chunk_index += 1
        else:
            # Section is large — sub-chunk it
            sub_chunks = chunk_text(section, source_name, CHUNK_SIZE, CHUNK_OVERLAP)
            for sc in sub_chunks:
                sc["chunk_index"] = chunk_index
                sc["id"] = f"{source_name}_chunk_{chunk_index}"
                all_chunks.append(sc)
                chunk_index += 1

    return all_chunks


# ─────────────────────────────────────────────────────────────
# MAIN INGESTION
# ─────────────────────────────────────────────────────────────

def ingest():
    print("=" * 60)
    print("  CloudBox RAG — Knowledge Base Ingestion")
    print("=" * 60)

    # 1. Load embedding model
    print(f"\n[1/4] Loading embedding model: '{EMBEDDING_MODEL}'...")
    t0 = time.time()
    model = SentenceTransformer(EMBEDDING_MODEL)
    print(f"      [OK] Model loaded in {time.time() - t0:.1f}s")

    # 2. Initialize ChromaDB persistent client
    print(f"\n[2/4] Initializing ChromaDB at: {CHROMA_DIR}")
    os.makedirs(CHROMA_DIR, exist_ok=True)
    client = chromadb.PersistentClient(path=CHROMA_DIR)

    # Delete existing collection to rebuild fresh
    try:
        client.delete_collection(name=COLLECTION_NAME)
        print(f"      [OK] Deleted existing collection '{COLLECTION_NAME}' (rebuilding fresh)")
    except Exception:
        print(f"      [OK] No existing collection found, creating new one")

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "CloudBox customer support knowledge base"}
    )
    print(f"      [OK] Collection '{COLLECTION_NAME}' created")

    # 3. Read, chunk, and embed all knowledge base files
    print(f"\n[3/4] Processing knowledge base files...")
    all_chunks = []

    for kb_name, kb_path in KB_FILES.items():
        if not os.path.exists(kb_path):
            print(f"      [WARNING] SKIPPING: '{kb_path}' not found")
            continue

        with open(kb_path, "r", encoding="utf-8") as f:
            text = f.read()

        # Use section-based chunking for structured .txt files
        chunks = chunk_by_sections(text, source_name=kb_name)
        all_chunks.extend(chunks)
        print(f"      [OK] '{kb_name}.txt' -> {len(chunks)} chunks")

    print(f"\n      Total chunks to embed: {len(all_chunks)}")

    # 4. Embed and upsert in batches
    print(f"\n[4/4] Embedding chunks and inserting into ChromaDB...")
    t0 = time.time()

    batch_size = 32
    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i : i + batch_size]
        texts = [c["text"] for c in batch]
        ids = [c["id"] for c in batch]
        metadatas = [
            {"source": c["source"], "chunk_index": c["chunk_index"]}
            for c in batch
        ]

        # Generate embeddings
        embeddings = model.encode(texts, show_progress_bar=False).tolist()

        # Insert into ChromaDB
        collection.add(
            documents=texts,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas
        )

        progress = min(i + batch_size, len(all_chunks))
        print(f"      Inserted {progress}/{len(all_chunks)} chunks...", end="\r")

    elapsed = time.time() - t0
    print(f"\n      [OK] All {len(all_chunks)} chunks embedded and stored in {elapsed:.1f}s")

    print("\n" + "=" * 60)
    print(f"  [SUCCESS] Ingestion complete!")
    print(f"     Collection : {COLLECTION_NAME}")
    print(f"     Total chunks: {len(all_chunks)}")
    print(f"     ChromaDB path: {CHROMA_DIR}")
    print("=" * 60)
    print("\nYou can now start the backend server. The RAG system will")
    print("use semantic vector search for all customer queries.\n")


if __name__ == "__main__":
    ingest()
