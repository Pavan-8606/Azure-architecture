# Azure Batch for an Engineering Simulation Workload

A local-first engineering simulation platform designed to submit and monitor ~300 simulation jobs across compute nodes.

This initial phase sets up the core modular project structure separating the **React + Vite** frontend and **Python Flask** backend.

---

## Project Structure

```
engineering-simulation/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask application factory
│   │   ├── config.py            # Backend configuration
│   │   ├── api/                 # REST API blueprints & routes (/api/health)
│   │   ├── models/              # SQLite database schemas (future phase)
│   │   ├── services/            # Core business logic layer
│   │   └── simulation/          # Python simulation engine logic
│   ├── instance/                # SQLite storage location
│   ├── run.py                   # Backend entry point
│   ├── requirements.txt         # Backend Python dependencies
│   └── .gitignore               # Backend gitignore
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # API client helper (client.js)
│   │   ├── components/          # React UI components
│   │   ├── pages/               # React application pages
│   │   ├── styles/              # Custom styling
│   │   ├── App.jsx              # Main React application component
│   │   └── main.jsx             # React entry point
│   ├── index.html               # Main HTML document
│   ├── vite.config.js           # Vite config with /api proxy to http://localhost:5000
│   ├── package.json             # Frontend npm dependencies
│   └── .gitignore               # Frontend gitignore
└── README.md                    # Setup and execution guide
```

---

## Local Setup & Quick Start Guide

### 1. Backend Setup (Flask API)

#### Step 1: Create and Activate Virtual Environment
From the project root directory (`engineering-simulation/`), run:

**On Windows (PowerShell):**
```powershell
python -m venv backend/venv
.\backend\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
python -m venv backend\venv
backend\venv\Scripts\activate.bat
```

**On macOS / Linux:**
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
```

#### Step 2: Install Backend Dependencies
With the virtual environment activated, install the required packages:

```bash
pip install -r backend/requirements.txt
```

#### Step 3: Start the Flask Backend Server
Run the Flask server:

```bash
python backend/run.py
```

The API will start running locally at `http://localhost:5000`. You can test the health check endpoint directly at `http://localhost:5000/api/health`.

---

### 2. Frontend Setup (React + Vite)

Open a **new terminal window/tab** in the project root directory (`engineering-simulation/`).

#### Step 1: Navigate to Frontend and Install Dependencies

```bash
cd frontend
npm install
```

#### Step 2: Start Vite Development Server

```bash
npm run dev
```

The frontend application will start running at `http://localhost:5173`.

---

## Verifying Setup

1. Open `http://localhost:5173` in your browser.
2. The page will automatically query the `/api/health` backend endpoint via the Vite dev proxy.
3. You should see a green **Connected** indicator showing the JSON response:
   ```json
   {
     "message": "Engineering Simulation API is running",
     "status": "ok"
   }
   ```
