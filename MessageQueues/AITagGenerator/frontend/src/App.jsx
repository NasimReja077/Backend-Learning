import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      setStatus("Submitting...");
      const res = await axios.post("http://localhost:5000/generate-tags", { url });
      setJobId(res.data.jobId);
      setStatus("Job added! Processing...");
    } catch (err) {
      setStatus("Error submitting job");
    }
  };

  // 🔥 Polling
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const res = await axios.get(`http://localhost:5000/job/${jobId}`);

      if (res.data.state === "completed") {
        setResult(res.data.result);
        setStatus("✅ Completed");
        clearInterval(interval);
      } else if (res.data.state === "failed") {
        setStatus("❌ Failed");
        clearInterval(interval);
      } else {
        setStatus(`⏳ ${res.data.state}... (${res.data.progress || 0}%)`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🚀 AI Tag Generator</h1>

      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "400px", padding: "10px" }}
      />

      <br /><br />

      <button onClick={handleSubmit} style={{ padding: "10px 20px" }}>
        Generate Tags
      </button>

      <br /><br />
      {jobId && <p>🆔 Job ID: {jobId}</p>}
      <p>{status}</p>

      {/* 🔥 RESULT SHOW */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>📄 Original Title:</h3>
          <p>{result.originalTitle}</p>

          <h3>🤖 AI Result:</h3>
          <pre>{result.ai}</pre>
        </div>
      )}
    </div>
  );
}