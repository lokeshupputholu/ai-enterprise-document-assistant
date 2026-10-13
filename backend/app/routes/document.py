import os

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

from app.services.pdf_service import (
    extract_pages,
    split_text
)

from app.services.embedding_service import (
    create_embedding
)

from app.services.vector_service import (
    add_document,
    get_document_chunk_count,
    delete_document
)


router = APIRouter()


UPLOAD_DIR = "documents"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )


    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )


    # Prevent duplicate documents
    if os.path.exists(file_path):

        raise HTTPException(
            status_code=409,
            detail="This document already exists"
        )


    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(
            await file.read()
        )


    pages = extract_pages(
        file_path
    )


    if not pages:

        os.remove(file_path)

        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF"
        )


    total_chunks = 0


    for page_number, page_text in pages:

        chunks = split_text(
            page_text
        )


        for chunk in chunks:

            embedding = create_embedding(
                chunk
            )


            add_document(
                chunk,
                embedding,
                file.filename,
                page_number
            )


            total_chunks += 1


    return {

        "filename": file.filename,

        "message":
            "PDF uploaded and indexed successfully",

        "chunks_created":
            total_chunks,

        "pages_processed":
            len(pages)

    }


@router.get("/")
def get_documents():

    documents = []


    for filename in os.listdir(
        UPLOAD_DIR
    ):

        if not filename.lower().endswith(".pdf"):
            continue


        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )


        chunk_count = get_document_chunk_count(
            filename
        )


        pages = extract_pages(
            file_path
        )


        documents.append({

            "name": filename,

            "size":
                os.path.getsize(
                    file_path
                ),

            "pages":
                len(pages),

            "chunks":
                chunk_count,

            "status":
                "Indexed"

        })


    return {

        "documents":
            documents

    }


@router.delete("/{filename}")
def remove_document(
    filename: str
):

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )


    if not os.path.exists(
        file_path
    ):

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )


    # Remove ChromaDB embeddings
    delete_document(
        filename
    )


    # Remove PDF file
    os.remove(
        file_path
    )


    return {

        "message":
            "Document deleted successfully",

        "filename":
            filename

    }