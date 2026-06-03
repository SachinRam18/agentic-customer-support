"""
Sentiment analysis module for the customer support system.
Integrates Gemini-based sentiment analysis with a robust local fallback.
Tracks sentiment trends and determines if escalation is required.
"""

from typing import List, Dict, Any, Tuple
import json
import logging
from google.genai import types
from backend.models import SentimentResult, SentimentLevel, ChatMessage

logger = logging.getLogger("uvicorn.error")

# Keywords for local fallback sentiment analysis
NEGATIVE_KEYWORDS = [
    "bad", "terrible", "worst", "hate", "angry", "frustrated", "annoyed", "useless",
    "garbage", "trash", "slow", "broken", "fail", "error", "stupid", "suck", "crap",
    "disappointed", "refund", "cancel", "dispute", "poor", "horrible", "unacceptable",
    "fix this", "waste of money", "dont work", "don't work", "cannot access"
]

POSITIVE_KEYWORDS = [
    "great", "awesome", "excellent", "love", "good", "happy", "helpful", "thanks",
    "thank you", "perfect", "resolved", "solved", "fantastic", "amazing", "wonderful"
]

HIGH_FRUSTRATION_PHRASES = [
    "give me my money", "legal action", "sue", "scam", "ripoff", "rip off",
    "worst support", "unacceptable", "speak to a manager", "talk to human",
    "fraud", "illegal", "reporting you"
]

def analyze_sentiment_local(message: str) -> SentimentResult:
    """
    Keyword-based fallback for sentiment analysis.
    """
    msg = message.lower()
    
    # Check for extreme frustration phrases
    for phrase in HIGH_FRUSTRATION_PHRASES:
        if phrase in msg:
            return SentimentResult(
                level=SentimentLevel.NEGATIVE,
                confidence=0.9,
                escalation_recommended=True
            )
            
    # Count keywords
    neg_count = sum(1 for kw in NEGATIVE_KEYWORDS if kw in msg)
    pos_count = sum(1 for kw in POSITIVE_KEYWORDS if kw in msg)
    
    if neg_count > pos_count:
        confidence = min(0.5 + 0.1 * neg_count, 0.95)
        # Suggest escalation if there are multiple negative keywords or specific triggers
        escalate = neg_count >= 2 or "cancel" in msg or "refund" in msg or "suck" in msg
        return SentimentResult(
            level=SentimentLevel.NEGATIVE,
            confidence=confidence,
            escalation_recommended=escalate
        )
    elif pos_count > neg_count:
        confidence = min(0.5 + 0.1 * pos_count, 0.95)
        return SentimentResult(
            level=SentimentLevel.POSITIVE,
            confidence=confidence,
            escalation_recommended=False
        )
    else:
        return SentimentResult(
            level=SentimentLevel.NEUTRAL,
            confidence=0.5,
            escalation_recommended=False
        )

def analyze_sentiment_gemini(message: str, client: Any) -> SentimentResult:
    """
    Analyzes sentiment using the Gemini API.
    """
    prompt = f"""Analyze the sentiment of this customer support chat message.
Respond in JSON format with three fields:
- sentiment: "positive", "neutral", or "negative"
- confidence: float between 0.0 and 1.0 representing your classification confidence
- escalation_recommended: boolean (set to true if the customer seems extremely frustrated, angry, or threatens to cancel/sue/etc.)

Message: "{message}"
JSON:"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        data = json.loads(response.text.strip())
        level = SentimentLevel(data.get("sentiment", "neutral").lower())
        confidence = float(data.get("confidence", 0.8))
        escalate = bool(data.get("escalation_recommended", False))
        
        return SentimentResult(
            level=level,
            confidence=confidence,
            escalation_recommended=escalate
        )
    except Exception as e:
        logger.error(f"Error in Gemini sentiment analysis: {e}, falling back to local analysis", exc_info=True)
        print(f"Error in Gemini sentiment analysis: {e}, falling back to local analysis", flush=True)
        return analyze_sentiment_local(message)

def get_session_sentiment_trend(messages: List[ChatMessage]) -> List[SentimentLevel]:
    """
    Extracts the list of sentiment levels from a list of messages.
    """
    trend = []
    for msg in messages:
        if msg.role == "user" and msg.sentiment:
            trend.append(msg.sentiment.level)
    return trend

def should_auto_escalate(messages: List[ChatMessage]) -> bool:
    """
    Determines if the session should auto-escalate to a human agent.
    Rules:
    - 3+ consecutive negative user messages
    - Average negativity > 60% (over at least 3 messages)
    - Any single message with extreme frustration (sentiment.escalation_recommended == True)
    """
    user_messages = [m for m in messages if m.role == "user"]
    if not user_messages:
        return False
        
    # Rule 3: Extreme frustration on the latest message
    latest_msg = user_messages[-1]
    if latest_msg.sentiment and latest_msg.sentiment.escalation_recommended:
        return True
        
    # Rule 1: 3+ consecutive negative user messages
    consecutive_neg = 0
    for msg in reversed(user_messages):
        if msg.sentiment and msg.sentiment.level == SentimentLevel.NEGATIVE:
            consecutive_neg += 1
            if consecutive_neg >= 3:
                return True
        else:
            break
            
    # Rule 2: Overall session negativity > 60% (minimum 3 messages)
    if len(user_messages) >= 3:
        neg_count = sum(1 for m in user_messages if m.sentiment and m.sentiment.level == SentimentLevel.NEGATIVE)
        if (neg_count / len(user_messages)) >= 0.6:
            return True
            
    return False
