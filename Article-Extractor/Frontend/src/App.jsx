import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExtract = async () => {
    try {
      setLoading(true);
      setError("");
      setArticle(null);

      // ✅ validation
      if (!url.startsWith("http")) {
        alert("Enter valid URL (http/https)");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/article/extract",
        { url }
      );

      setArticle(res.data.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🧠 Article Extractor</h1>

      <input
        type="text"
        placeholder="Enter URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "400px", padding: "10px" }}
      />

      <button onClick={handleExtract} style={{ marginLeft: "10px" }}>
        Extract
      </button>

      {/* Loading */}
      {loading && <p>⏳ Loading...</p>}

      {/* Error */}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {/* Result */}
      {article && (
        <div style={{ marginTop: "20px" }}>
          <h2>{article.title}</h2>
          <p>{article.byline}</p>

          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      )}
    </div>
  );
}

export default App;