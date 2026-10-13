import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=api_key
)


def generate_answer(question, context):

    prompt = f"""
You are an enterprise document assistant.

Answer the user's question using only the
information provided in the context.

If the answer is not available in the context,
say that the information was not found in the
uploaded documents.

Context:
{context}

Question:
{question}

Provide a clear and concise answer.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text