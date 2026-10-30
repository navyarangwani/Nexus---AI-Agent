# Live Cloud Deployment Guide

This project is fully dockerized and pre-configured for **1-click cloud deployment** on all major cloud providers.

---

## ⚡ Instant Live URL (Active Now)

For immediate testing, demonstrations, or sharing with reviewers right away:
- **Public URL**: `https://tidy-ideas-sip.loca.lt`
- **Tunnel Password / IP**: `49.43.25.243` *(If localtunnel shows a friendly verification screen on first visit, simply enter this IP and click Submit)*.
- **Health Check**: `https://tidy-ideas-sip.loca.lt/api/health`

---

## 🚀 Option 1: Render (Recommended — 100% Free Web Service)

Render is the standard choice for assignments because it offers a free tier, native Docker support, and automatic deployment on every `git push`.

### Steps:
1. Push your local repository to GitHub:
   ```bash
   # Create a new repository on https://github.com/new (e.g. "production-ai-research-agent")
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/production-ai-research-agent.git
   git push -u origin main
   ```
2. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
3. Select your GitHub repository.
4. Render will automatically detect the `render.yaml` or `Dockerfile`:
   - **Environment**: Docker
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
5. Click **Create Web Service**.
6. Render builds the React frontend, packages the FastAPI backend, and provisions your live HTTPS URL:
   `https://nexus-research-agent.onrender.com`

---

## 🤖 Option 2: Hugging Face Spaces (Best for AI & ML Credibility)

Hugging Face Spaces provides **100% free hosting (2 vCPU, 16 GB RAM)** with permanent uptime and no cold starts. Recruiters and engineering hiring managers love Hugging Face links.

### Steps:
1. Go to [huggingface.co/new-space](https://huggingface.co/new-space).
2. Space Name: `nexus-research-agent`
3. License: `mit` or `apache-2.0`
4. Select **Space SDK**: **Docker** ➔ **Blank**.
5. Push your code to your new Hugging Face Space:
   ```bash
   git remote add hf https://huggingface.co/spaces/<YOUR_HF_USERNAME>/nexus-research-agent
   git push -u hf main
   ```
6. Hugging Face will automatically run the multi-stage `Dockerfile`, start the server on `$PORT`, and embed your interactive glassbox studio on:
   `https://huggingface.co/spaces/<YOUR_HF_USERNAME>/nexus-research-agent`

---

## 🚂 Option 3: Railway (Fastest PaaS)

Railway offers instantaneous deployment with zero configuration.

### Steps:
1. Go to [railway.app](https://railway.app/) and sign in with GitHub.
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select `production-ai-research-agent`.
4. Railway will automatically detect `railway.json` and `Dockerfile`.
5. Under Settings ➔ **Networking**, click **Generate Domain**.
6. Your live HTTPS app is ready at `https://production-ai-research-agent.up.railway.app`.

---

## 🐳 Option 4: Local Docker Run

If you wish to run the container locally on any machine with Docker installed:
```bash
# Build the production image
docker build -t nexus-research-agent:latest .

# Run the container mapping port 8000
docker run -p 8000:8000 nexus-research-agent:latest
```
Visit `http://localhost:8000` in your browser.
