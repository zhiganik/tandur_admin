import { useState } from 'react'

interface HealthResponse {
  status: string
  timestamp: string
}

function App() {
  const [result, setResult] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`)

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const data: HealthResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tandur Admin Panel</h1>
      <p style={styles.subtitle}>Server health check</p>

      <button
        onClick={checkHealth}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Checking...' : 'Check Server Health'}
      </button>

      {result && (
        <div style={styles.success}>
          <p style={styles.label}>Status</p>
          <p style={styles.value}>✅ {result.status}</p>
          <p style={styles.label}>Timestamp</p>
          <p style={styles.value}>{new Date(result.timestamp).toLocaleString()}</p>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          <p style={styles.label}>Error</p>
          <p style={styles.value}>❌ {error}</p>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    fontFamily: 'sans-serif',
    padding: '24px',
  },
  title: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 700,
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#888888',
    fontSize: '14px',
    margin: '0 0 40px 0',
  },
  button: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    border: '1px solid #333333',
    borderRadius: '999px',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  success: {
    marginTop: '32px',
    backgroundColor: '#0a1a0a',
    border: '1px solid #1a4a1a',
    borderRadius: '12px',
    padding: '24px',
    minWidth: '300px',
    textAlign: 'center',
  },
  error: {
    marginTop: '32px',
    backgroundColor: '#1a0a0a',
    border: '1px solid #4a1a1a',
    borderRadius: '12px',
    padding: '24px',
    minWidth: '300px',
    textAlign: 'center',
  },
  label: {
    color: '#888888',
    fontSize: '12px',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  value: {
    color: '#ffffff',
    fontSize: '16px',
    margin: '0 0 16px 0',
    fontWeight: 500,
  },
}

export default App
