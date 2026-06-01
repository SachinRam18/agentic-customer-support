from google import genai

client = genai.Client(api_key="AQ.Ab8RN6LzHkJRfOmyxgP2zdYk6_iGkc5UXesJy2viv80AXjcF_w")

models = client.models.list()

for model in models:
    print(model.name)