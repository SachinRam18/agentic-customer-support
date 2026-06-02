"""
RAG (Retrieval-Augmented Generation) module for policy lookup.
Implements a keyword/token-overlap search across FAQs and policies.
"""

from typing import List, Dict, Any, Tuple
import re
from backend.policies import support_faqs, support_policies

# Stopwords to filter out during token search
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

class PolicyRAG:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.load_documents()

    def load_documents(self):
        """
        Loads FAQs and Policies from policies.py and indexes them.
        """
        # Load FAQs
        for faq in support_faqs:
            self.documents.append({
                "id": faq["id"],
                "source": f"FAQ: {faq['question']}",
                "title": faq["question"],
                "text": f"Category: {faq['category']}\nQuestion: {faq['question']}\nAnswer: {faq['answer']}",
                "category": faq["category"]
            })
            
        # Load Policies
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
        """
        Clean text, lowercase, split to tokens and filter stopwords.
        """
        words = re.findall(r'\b\w+\b', text.lower())
        return [w for w in words if w not in STOPWORDS]

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        TF-IDF/Token overlap search over indexed documents.
        """
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scored_docs = []
        for doc in self.documents:
            # Tokenize title and text
            title_tokens = self._tokenize(doc["title"])
            text_tokens = self._tokenize(doc["text"])
            
            # Count overlaps with weights
            title_matches = sum(1 for t in query_tokens if t in title_tokens)
            text_matches = sum(1 for t in query_tokens if t in text_tokens)
            
            # Score formula: 3.0 points for title match, 1.0 points for body match
            score = (title_matches * 3.0) + (text_matches * 1.0)
            
            if score > 0:
                scored_docs.append((score, doc))
                
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        
        return [item[1] for item in scored_docs[:top_k]]

    def format_context(self, results: List[Dict[str, Any]]) -> str:
        """
        Formats search results into a clean text block to feed into the prompt.
        """
        if not results:
            return "No relevant policy documents found."
            
        formatted = "Here are the relevant policies and FAQ answers:\n\n"
        for i, doc in enumerate(results):
            formatted += f"[{i+1}] Source: {doc['source']}\n{doc['text']}\n\n"
        return formatted

    def get_rag_context(self, message: str) -> Tuple[str, List[str]]:
        """
        Perform RAG retrieval for the message.
        Returns:
            - formatted_context: Context string to inject in the prompt
            - citations: List of source names for user-facing reference citations
        """
        results = self.search(message, top_k=2)
        if not results:
            return "", []
            
        citations = [doc["source"] for doc in results]
        return self.format_context(results), citations

# Singleton instance
policy_rag = PolicyRAG()
