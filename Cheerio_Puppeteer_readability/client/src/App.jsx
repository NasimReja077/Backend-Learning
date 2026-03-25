import { useState } from "react";
import axios from "axios";

function App() {
  // URL input state
  const [url, setUrl] = useState("");

  // Article data
  const [article, setArticle] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Button click function
  const handleExtract = async () => {
    try {
      setLoading(true);

      // Backend API call
      const res = await axios.post("http://localhost:5000/extract", {
        url,
      });

      // Data store
      setArticle(res.data.data);
    } catch (err) {
      alert("Error fetching article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📰 Article Extractor</h1>

      {/* URL input */}
      <input
        type="text"
        placeholder="Enter URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "400px", padding: "10px" }}
      />

      {/* Button */}
      <button onClick={handleExtract} style={{ marginLeft: "10px" }}>
        Extract
      </button>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Output */}
      {article && (
        <div style={{ marginTop: "20px" }}>
          <h2>{article.title}</h2>

          <p><b>Source:</b> {article.siteName}</p>

          <p><i>{article.excerpt}</i></p>

          <hr />

          {/* Full content */}
          <p style={{ whiteSpace: "pre-line" }}>
            {article.content}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;