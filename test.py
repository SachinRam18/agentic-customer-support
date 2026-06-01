from google import genai

client = genai.Client(
    api_key="AQ.Ab8RN6LzHkJRfOmyxgP2zdYk6_iGkc5UXesJy2viv80AXjcF_w"
)

response = client.models.generate_content(
    model="gemini-2.0-flash-lite",
    contents="what is agentic ai?"
)

print(response.text)