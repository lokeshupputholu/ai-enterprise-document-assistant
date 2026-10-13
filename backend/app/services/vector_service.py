import chromadb


client = chromadb.PersistentClient(
    path="chroma_db"
)


collection = client.get_or_create_collection(
    name="documents_v2"
)


def add_document(
    chunk,
    embedding,
    document_name,
    page_number
):

    collection.add(
        documents=[chunk],
        embeddings=[embedding],
        metadatas=[
            {
                "document": document_name,
                "page": page_number
            }
        ],
        ids=[
            f"{document_name}_{page_number}_{collection.count()}"
        ]
    )


def search_documents(
    query_embedding,
    top_k=3
):

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results


def get_document_chunk_count(
    document_name
):

    results = collection.get(
        where={
            "document": document_name
        }
    )

    return len(
        results.get("ids", [])
    )


def delete_document(
    document_name
):

    collection.delete(
        where={
            "document": document_name
        }
    )