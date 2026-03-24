import { useState } from 'react';
import axios from 'axios';

export default function SavePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/save', { url }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setResult(res.data.data);
      alert('Saved with AI title & tags!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Save Anything to Your Brain</h1>
      
      <input
        type="url"
        placeholder="Paste link here (article, YouTube, tweet, PDF...)"
        value={url}
        onChange={e => setUrl(e.target.value)}
        className="w-full p-4 border rounded-xl text-lg"
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 w-full bg-black text-white py-4 rounded-xl text-xl font-medium"
      >
        {loading ? 'AI is thinking...' : 'Save & Let AI Tag'}
      </button>

      {result && (
        <div className="mt-10 p-6 bg-green-50 rounded-2xl">
          <h2 className="text-2xl font-semibold">{result.title}</h2>
          <div className="flex gap-2 mt-4 flex-wrap">
            {result.tags.map(tag => (
              <span key={tag} className="bg-blue-100 px-4 py-1 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}