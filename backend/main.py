from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os

os.environ["GROQ_API_KEY"] = "gsk_YOUR_KEY_HERE"
client = Groq(api_key=os.environ["GROQ_API_KEY"])

app = FastAPI(title="magbot.ai Agentic Support API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

def classify_intent(message: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=50,
        messages=[{
            "role": "user",
            "content": f"""Classify this message into one category:
- information_query
- action_request
- complaint
- ambiguous

Message: "{message}"
Reply with only the category name."""
        }]
    )
    return response.choices[0].message.content.strip()

@app.post("/chat")
async def chat(request: ChatRequest):
    message = request.message
    intent = classify_intent(message)

    if intent == "information_query":
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"You are a helpful customer support agent for magbot.ai. Answer this question clearly and politely. Question: {message}"
            }]
        )
        reply = response.choices[0].message.content

    elif intent == "action_request":
        reply = f"I understand you want to: '{message}'. Can you please confirm your account email first?"

    elif intent == "complaint":
        reply = "I'm really sorry you're having a bad experience. Let me connect you with a human agent right away."

    else:
        reply = "Could you please give me a bit more detail about what you need?"

    return {
        "reply": reply,
        "intent": intent,
        "message": message
    }

@app.get("/")
def root():
    return {"status": "magbot.ai backend is running! 🚀"}