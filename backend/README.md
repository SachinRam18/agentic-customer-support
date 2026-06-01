# 🤖 magbot.ai — Backend

Agentic Customer Support Backend built with FastAPI and Groq LLM.

## ⚙️ Tech Stack

- **Python 3.11+**
- **FastAPI** — REST API framework
- **Groq API** — LLM (llama-3.3-70b-versatile)
- **LangGraph** — Agentic pipeline (coming soon)

## 🚀 Run Locally

**Prerequisites:** Python 3.11+

1. Install dependencies:
```bash
   pip install -r requirements.txt
```

2. Set your API key in `.env`:
GROQ_API_KEY=your_groq_key_here

3. Run the server:
```bash
   uvicorn main:app --reload
```

4. Open API docs:
http://127.0.0.1:8000/docs

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/chat` | Send message, get AI reply |

## 📨 Example

**Request:**
```json
{
  "message": "Cancel my subscription",
  "session_id": "user123"
}
```

**Response:**
```json
{
  "reply": "I understand you want to cancel. Can you confirm your email?",
  "intent": "action_request",
  "message": "Cancel my subscription"
}
```

## 🧠 Intent Types

| Intent | Example |
|---|---|
| `information_query` | "What is your refund policy?" |
| `action_request` | "Cancel my subscription" |
| `complaint` | "This service is terrible!" |
| `ambiguous` | "Update it" |