# SETUP.md — Tandur Admin Panel

> Instructions for Claude Code to create a minimal React web app.
> One page, one button — checks API health and shows the response.

---

## What to build

- React + Vite project (fastest setup)
- Single page with a button "Check Server Health"
- Calls `GET /health` on the API
- Shows response on screen (status + timestamp)
- Deploy script to push to server

---

## Step 1 — Create the project

```bash
npm create vite@latest tandur-admin -- --template react-ts
cd tandur-admin
npm install
```

---

## Step 2 — Project structure

Keep it minimal:

```
tandur-admin/
├── src/
│   ├── App.tsx          ← main page with health check button
│   ├── main.tsx         ← entry point
│   └── index.css        ← basic styles
├── .env                 ← API url (not in git)
├── .env.example         ← template (in git)
├── .gitignore
├── deploy.sh            ← one command deploy to server
├── index.html
├── vite.config.ts
└── package.json
```

---

## Step 3 — .env.example

Create at project root. Commit to git:

```bash
# Copy to .env and fill in real value
# cp .env.example .env

VITE_API_URL=http://178.104.44.54
```

---

## Step 4 — .env

Create at project root. Do NOT commit (already in .gitignore):

```bash
VITE_API_URL=http://178.104.44.54
```

---

## Step 5 — .gitignore

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Secrets
.env
.env.*

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
```

---

## Step 6 — App.tsx

Replace the default App.tsx with this:

```tsx
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
```

---

## Step 7 — index.css

Replace default with:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #0f0f0f;
}
```

---

## Step 8 — vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
})
```

---

## Step 9 — deploy.sh

Create at project root:

```bash
#!/bin/bash

SERVER_ALIAS="tandur"
SERVER_ADMIN_PATH="/home/deploy/admin-panel"
BACKEND_PATH="/home/deploy/app"

echo "📦 Building..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting."
  exit 1
fi

echo "📤 Uploading to server..."
scp -r dist/* $SERVER_ALIAS:$SERVER_ADMIN_PATH/

echo "🔁 Restarting Nginx..."
ssh $SERVER_ALIAS "cd $BACKEND_PATH && docker compose restart nginx"

echo "✅ Done!"
echo "   Open: http://178.104.44.54"
```

Make it executable:

```bash
chmod +x deploy.sh
```

---

## Step 10 — Run locally

```bash
npm run dev
```

Opens at `http://localhost:3000`

Click the button — calls your server health endpoint and shows the response.

---

## Step 11 — Deploy to server

Create the folder on server first (one time only):

```bash
ssh tandur "mkdir -p /home/deploy/admin-panel"
```

Then every deploy:

```bash
./deploy.sh
```

Open `http://178.104.44.54` in browser — admin panel loads, click button, see health response.

---

## Step 12 — Backend repo nginx changes needed

In your `tandur_backend` repo make these two changes:

### docker-compose.yml — add admin volume to nginx service
```yaml
nginx:
  image: nginx:alpine
  container_name: tandur_nginx
  restart: always
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - /home/deploy/admin-panel:/usr/share/nginx/admin:ro
  depends_on:
    - api
  networks:
    - internal
```

### nginx/nginx.conf — serve admin panel on / and API on /api/
```nginx
events {}

http {
    server {
        listen 80;
        server_name _;

        location /api/ {
            proxy_pass         http://api:8080/;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }

        location / {
            root  /usr/share/nginx/admin;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

> Note: with this config the health endpoint becomes `http://178.104.44.54/api/health`
> Update VITE_API_URL in .env to `http://178.104.44.54/api` accordingly.

Push backend changes to git, then on server:

```bash
ssh tandur
cd /home/deploy/app
git pull
docker compose up -d --build
```

---

## Final checklist for Claude Code

- [ ] Vite + React + TypeScript project created
- [ ] `App.tsx` with health check button, loading state, success and error display
- [ ] `index.css` with dark background reset
- [ ] `.env` with `VITE_API_URL=http://178.104.44.54`
- [ ] `.env.example` committed to git
- [ ] `.gitignore` with node_modules, dist, .env excluded
- [ ] `vite.config.ts` configured with port 3000
- [ ] `deploy.sh` created
- [ ] `npm run dev` works at localhost:3000
- [ ] Button calls `/health` and shows status + timestamp
- [ ] `npm run build` produces `/dist` folder without errors
