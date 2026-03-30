import { useState } from "react";
import axios from "axios";

export default function App() {
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    try {
      setStatus("Submitting...");
      const res = await axios.post("http://localhost:5000/generate-tags", { url });
      setJobId(res.data.jobId);
      setStatus("Job added! Check server logs for progress.");
    } catch (err) {
      setStatus("Error submitting job");
    }
  };

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
    </div>
  );
}
