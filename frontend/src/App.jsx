import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  const [file, setFile] = useState(null);

  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [documents, setDocuments] = useState([]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const [asking, setAsking] = useState(false);

  const [deleting, setDeleting] = useState("");


  // Load documents when page opens
  useEffect(() => {
    loadDocuments();
  }, []);


  // Get documents from backend
  const loadDocuments = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/documents/"
      );

      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      }

    } catch (error) {
      console.error(
        "Failed to load documents:",
        error
      );
    }
  };


  // Upload document
  const handleUpload = async () => {

    if (!file) {
      setUploadMessage(
        "Please select a PDF file."
      );
      return;
    }


    const formData = new FormData();

    formData.append(
      "file",
      file
    );


    try {

      setUploading(true);

      setUploadMessage("");


      const response = await fetch(
        "http://127.0.0.1:8000/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Upload failed"
        );
      }


      setUploadMessage(
        `✓ ${file.name} uploaded successfully. ${data.chunks_created} chunks indexed.`
      );


      // Reload complete document list
      await loadDocuments();


      // Clear selected file
      setFile(null);


    } catch (error) {

      setUploadMessage(
        `✕ ${error.message}`
      );

    } finally {

      setUploading(false);

    }

  };


  // Delete document
  const handleDelete = async (filename) => {

    const confirmed = window.confirm(
      `Are you sure you want to delete "${filename}"?`
    );


    if (!confirmed) {
      return;
    }


    try {

      setDeleting(filename);


      const response = await fetch(
        `http://127.0.0.1:8000/documents/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Delete failed"
        );
      }


      setDocuments(
        (previous) =>
          previous.filter(
            (document) =>
              document.name !== filename
          )
      );


      setUploadMessage(
        `✓ ${filename} deleted successfully.`
      );


    } catch (error) {

      setUploadMessage(
        `✕ ${error.message}`
      );

    } finally {

      setDeleting("");

    }

  };


  // Ask AI question
  const handleAsk = async () => {

    if (!question.trim()) {

      setAnswer(
        "Please enter a question."
      );

      return;

    }


    try {

      setAsking(true);

      setAnswer("");

      setSources([]);


      const response = await fetch(
        "http://127.0.0.1:8000/chat/ask",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question: question,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to get answer"
        );

      }


      setAnswer(
        data.answer ||
        "No answer found."
      );


      setSources(
        data.sources || []
      );


    } catch (error) {

      setAnswer(
        `Error: ${error.message}`
      );

    } finally {

      setAsking(false);

    }

  };


  // Display source
  const renderSource = (source) => {

    if (
      typeof source === "object" &&
      source !== null
    ) {

      const documentName =
        source.document ||
        source.filename ||
        "Unknown document";


      const page =
        source.page ||
        source.page_number;


      return (
        <>
          <strong>
            {documentName}
          </strong>

          {page && (
            <span className="source-page">
              Page {page}
            </span>
          )}

        </>
      );

    }


    return (
      <strong>
        {source}
      </strong>
    );

  };


  return (

    <div className="app">


      {/* HEADER */}

      <header className="header">

        <div className="header-content">


          <div className="logo">

            <div className="logo-icon">
              AI
            </div>


            <div>

              <h1>
                Enterprise Document Assistant
              </h1>

              <p>
                AI-powered document intelligence
              </p>

            </div>

          </div>


          <div className="status">

            <span className="status-dot"></span>

            AI Assistant Online

          </div>


        </div>

      </header>



      <main className="container">


        {/* INTRO */}

        <div className="intro">

          <h2>
            Document Intelligence
          </h2>

          <p>
            Upload a PDF and ask questions.
            The assistant retrieves relevant
            information from your documents
            and generates AI-powered answers.
          </p>

        </div>



        {/* UPLOAD */}

        <section className="card">


          <div className="section-title">

            <div className="section-icon">
              📄
            </div>


            <div>

              <h2>
                Upload Document
              </h2>

              <p>
                Add a PDF document to the knowledge base
              </p>

            </div>

          </div>



          <div className="upload-area">


            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              hidden

              onChange={(e) => {

                setFile(
                  e.target.files[0]
                );

                setUploadMessage("");

              }}

            />


            <label
              htmlFor="file-upload"
              className="file-label"
            >
              Choose PDF
            </label>



            {file && (

              <div className="selected-file">

                <span className="file-icon">
                  📄
                </span>


                <div>

                  <strong>
                    {file.name}
                  </strong>

                  <small>
                    PDF document selected
                  </small>

                </div>

              </div>

            )}



            <button
              className="upload-button"

              onClick={
                handleUpload
              }

              disabled={uploading}
            >

              {uploading
                ? "Uploading..."
                : "Upload Document"}

            </button>


          </div>



          {uploadMessage && (

            <div className="upload-message">

              {uploadMessage}

            </div>

          )}


        </section>



        {/* DOCUMENTS */}

        <section className="card">


          <div className="section-title">

            <div className="section-icon">
              📚
            </div>


            <div>

              <h2>
                Uploaded Documents
              </h2>

              <p>
                Documents available in the knowledge base
              </p>

            </div>

          </div>



          {documents.length > 0 ? (

            <div className="document-list">


              {documents.map(
                (document) => (

                  <div
                    className="document-item"
                    key={document.name}
                  >


                    <div className="document-icon">
                      📄
                    </div>



                    <div className="document-info">

                      <strong>
                        {document.name}
                      </strong>


                      <span>
                        {document.pages} pages •{" "}
                        {document.chunks} chunks
                      </span>

                    </div>



                    <div className="document-status">

                      <span className="status-dot"></span>

                      {document.status}

                    </div>



                    <button
                      className="delete-button"

                      onClick={() =>
                        handleDelete(
                          document.name
                        )
                      }

                      disabled={
                        deleting ===
                        document.name
                      }
                    >

                      {deleting ===
                      document.name
                        ? "Deleting..."
                        : "Delete"}

                    </button>


                  </div>

                )
              )}


            </div>

          ) : (

            <div className="no-sources">

              No documents uploaded yet.

            </div>

          )}


        </section>



        {/* ASK QUESTION */}

        <section className="card">


          <div className="section-title">

            <div className="section-icon">
              💬
            </div>


            <div>

              <h2>
                Ask a Question
              </h2>

              <p>
                Ask anything about your uploaded documents
              </p>

            </div>

          </div>



          <textarea

            value={question}

            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }

            placeholder="Example: What programming languages are mentioned?"

            rows="5"

          />



          <button
            className="ask-button"

            onClick={
              handleAsk
            }

            disabled={asking}
          >

            {asking
              ? "Searching documents..."
              : "Ask AI"}

          </button>


        </section>



        {/* AI ANSWER */}

        <section className="card">


          <div className="section-title">

            <div className="section-icon">
              ✨
            </div>


            <div>

              <h2>
                AI Answer
              </h2>

              <p>
                Generated from your documents
              </p>

            </div>

          </div>



          <div className="answer-box">


            {asking ? (

              <div className="loading">

                <div className="spinner"></div>

                <span>
                  AI is analyzing your documents...
                </span>

              </div>

            ) : answer ? (

              <p>
                {answer}
              </p>

            ) : (

              <p className="placeholder">

                Your AI-generated answer will appear here.

              </p>

            )}


          </div>


        </section>



        {/* SOURCES */}

        <section className="card">


          <div className="section-title">

            <div className="section-icon">
              🔎
            </div>


            <div>

              <h2>
                Sources
              </h2>

              <p>
                Documents used to generate the answer
              </p>

            </div>

          </div>



          {sources.length > 0 ? (

            <div className="source-list">


              {sources.map(
                (source, index) => (

                  <div
                    className="source-item"

                    key={index}
                  >


                    <span className="source-number">
                      {index + 1}
                    </span>


                    <div className="source-content">

                      {renderSource(
                        source
                      )}

                    </div>


                  </div>

                )
              )}


            </div>

          ) : (

            <div className="no-sources">

              No sources available yet.

            </div>

          )}


        </section>


      </main>



      {/* FOOTER */}

      <footer>

        <p>
          AI Enterprise Document Assistant
        </p>

        <span>
          FastAPI • React • ChromaDB • Gemini
        </span>

      </footer>


    </div>

  );

}


export default App;