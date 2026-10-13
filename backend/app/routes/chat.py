from fastapi import APIRouter
from pydantic import BaseModel

from app.services.embedding_service import create_embedding
from app.services.vector_service import search_documents
from app.services.llm_service import generate_answer


router = APIRouter()


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
def ask_question(request: QuestionRequest):

    # Create embedding for user question
    question_embedding = create_embedding(
        request.question
    )


    # Search relevant document chunks
    results = search_documents(
        question_embedding,
        top_k=3
    )


    documents = results.get(
        "documents",
        [[]]
    )[0]


    metadatas = results.get(
        "metadatas",
        [[]]
    )[0]


    distances = results.get(
        "distances",
        [[]]
    )[0]


    # No results
    if not documents:

        return {
            "question": request.question,
            "answer": "No relevant information found.",
            "sources": []
        }


    # Build context for Gemini
    context = "\n\n".join(
        documents
    )


    # Generate AI answer
    answer = generate_answer(
        request.question,
        context
    )


    # Build source information
    sources = []


    for index, metadata in enumerate(
        metadatas
    ):

        document = metadata.get(
            "document"
        )


        page = metadata.get(
            "page"
        )


        distance = None

        if index < len(distances):
            distance = distances[index]


        # Convert distance into an
        # approximate relevance score
        relevance = None

        if distance is not None:

            relevance = max(
                0,
                min(
                    100,
                    round(
                        (1 - distance) * 100
                    )
                )
            )


        if document:

            sources.append({

                "document": document,

                "page": page,

                "relevance": relevance

            })


    return {

        "question":
            request.question,

        "answer":
            answer,

        "sources":
            sources

    }