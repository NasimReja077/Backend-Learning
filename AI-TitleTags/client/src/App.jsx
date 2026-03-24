// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');

  // Auto load current tab URL
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ action: 'getCurrentTabUrl' }, (response) => {
        if (response?.url) setUrl(response.url);
      });
    } else {
      setUrl("https://www.iitk.ac.in/esc101/share/downloads/javnotes5.pdf");
    }
  }, []);

  // Test Token Button
  const setTestToken = () => {
    const testToken = "test-token-12345";   // You can change this
    setToken(testToken);
    setError(null);
    // Optional: save to chrome storage
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ jwtToken: testToken });
    }
    alert("✅ Test token applied! Now click Save button.");
  };

  const handleSave = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    if (!token) {
      setError("Click 'Use Test Token' first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/save',
        { url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      setResult(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Backend error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '380px', padding: '20px', fontFamily: 'system-ui', background: '#1a1a1a', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📚 Save to Second Brain</h2>

      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL here..."
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #444',
          background: '#2a2a2a',
          color: '#fff',
          marginBottom: '12px'
        }}
      />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={setTestToken}
          style={{
            flex: 1,
            padding: '10px',
            background: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Use Test Token
        </button>

        <button
          onClick={handleSave}
          disabled={loading || !url || !token}
          style={{
            flex: 1,
            padding: '10px',
            background: loading ? '#555' : '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : 'Save with AI'}
        </button>
      </div>

      {error && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#2a2a2a', borderRadius: '8px' }}>
          <strong>{result.title}</strong>
          <div style={{ marginTop: '10px' }}>
            {result.tags?.map((tag, i) => (
              <span key={i} style={{ marginRight: '8px', color: '#4ade80' }}>#{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;