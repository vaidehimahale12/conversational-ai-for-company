import React, { useState } from 'react';
import './App.css';

interface QueryResponse {
  sql: string;
  results: any[];
  explanation: string;
  latency: number;
}

function App() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('Employee');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, role }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to fetch results');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Conversational Data System</h1>
      </header>
      <main>
        <section className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role">User Role: </label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your data..."
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Ask'}
              </button>
            </div>
          </form>
        </section>

        {error && <div className="error-message">Error: {error}</div>}

        {response && (
          <section className="results-section">
            <div className="meta-info">
              <p><strong>Generated SQL:</strong> <code>{response.sql}</code></p>
              <p><strong>Latency:</strong> {response.latency.toFixed(4)} seconds</p>
              <p><strong>Info:</strong> {response.explanation}</p>
            </div>

            {response.results.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(response.results[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {response.results.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val: any, j) => (
                          <td key={j}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No results found.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
