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

      // ✅ Validation
      if (!url.startsWith("http")) {
        setError("Enter valid URL (http/https)");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/article/extract",
        { url }
      );

      setArticle(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧠 AI Article Extractor</h1>

      {/* Input */}
      <div style={styles.inputBox}>
        <input
          type="text"
          placeholder="Paste article URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleExtract} style={styles.button}>
          Extract
        </button>
      </div>

      {/* Loading */}
      {loading && <p style={styles.loading}>⏳ Extracting & Summarizing...</p>}

      {/* Error */}
      {error && <p style={styles.error}>❌ {error}</p>}

      {/* Result */}
      {article && (
        <div style={styles.result}>
          <h2>{article.title}</h2>
          <p style={{ color: "#666" }}>{article.byline}</p>

          {/* 🧠 AI Summary */}
          <div style={styles.aiBox}>
            <h3>🧠 Summary</h3>
            <p>{article.ai.summary}</p>

            <h3>📌 Key Points</h3>
            <ul>
              {article.ai.keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>

            <h3>🏷 Tags</h3>
            <div>
              {article.ai.tags.map((tag, i) => (
                <span key={i} style={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 📄 Original Content */}
          <div
            style={styles.content}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      )}
    </div>
  );
}

export default App;

// 🎨 Styles
const styles = {
  container: {
    maxWidth: "900px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  inputBox: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px 20px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  loading: {
    marginTop: "20px",
  },
  error: {
    color: "red",
    marginTop: "20px",
  },
  result: {
    marginTop: "30px",
  },
  aiBox: {
    background: "#f5f5f5",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  tag: {
    marginRight: "10px",
    background: "#d1fae5",
    padding: "5px 10px",
    borderRadius: "20px",
  },
  content: {
    marginTop: "20px",
    lineHeight: "1.6",
  },
};