# 🚀 Deploying Melody — Spotify Genre Studio to PythonAnywhere

This guide provides the exact steps to deploy **Melody — Spotify Genre Studio** to **PythonAnywhere** so anyone on the web can interact with the dataset, K-Means clustering, PCA projection, and recommendation engine.

---

## Architecture of the PythonAnywhere Deployment
- **Frontend:** React 18 + TypeScript + Tailwind CSS pre-compiled into `frontend/dist/`.
- **Backend & WSGI Engine:** The FastAPI application wrapped via `a2wsgi` into a standard WSGI entry point (`wsgi.py`). It serves both the compiled single-page frontend application and all REST API endpoints (`/api/...`).
- **Data Source:** The verified Spotify dataset (`backend/data/spotify_dataset.csv`) is bundled and loaded directly into memory at startup.

---

## Step 1: Open a Bash Console on PythonAnywhere

1. Log in to your [PythonAnywhere Dashboard](https://www.pythonanywhere.com).
2. Go to the **Consoles** tab.
3. Click on **Bash** to open a new cloud terminal.

---

## Step 2: Clone Your Repository

In the PythonAnywhere Bash console, run:
```bash
git clone https://github.com/KEERTHANAHL08/melody-spotify-studio.git
cd melody-spotify-studio
```

---

## Step 3: Set Up the Virtual Environment

In the same console, create a Python 3.10 virtual environment and install the deployment requirements:
```bash
mkvirtualenv --python=/usr/bin/python3.10 melody
pip install -r requirements_deploy.txt
```
*(This installs `fastapi`, `a2wsgi`, `pandas`, `numpy`, `scikit-learn`, and `python-multipart`)*

---

## Step 4: Configure the Web App

1. Go to the **Web** tab in PythonAnywhere.
2. Click **Add a new web app**.
3. Choose **Manual configuration** (do **NOT** select Django or Flask).
4. Select **Python 3.10**.
5. Once created, fill in the paths on the Web configuration page:
   - **Source code:** `/home/<your-username>/melody-spotify-studio`
   - **Working directory:** `/home/<your-username>/melody-spotify-studio`
   - **Virtualenv:** `/home/<your-username>/.virtualenvs/melody`
   *(Replace `<your-username>` with your actual PythonAnywhere username)*

---

## Step 5: Configure the WSGI Configuration File

1. On the **Web** tab, click on the **WSGI configuration file** link (e.g. `/var/www/<your-username>_pythonanywhere_com_wsgi.py`).
2. Delete everything inside and replace it with:

```python
import sys
import os

# Project root path
project_home = '/home/<your-username>/melody-spotify-studio'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

backend_path = os.path.join(project_home, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the WSGI application
from wsgi import application
```
*(Remember to replace `<your-username>` with your PythonAnywhere username!)*

3. Click **Save** in the top right.

---

## Step 6: Reload and View Live!

1. Go back to the **Web** tab.
2. Click the green **Reload <your-username>.pythonanywhere.com** button.
3. Open your live URL:
   ```
   https://<your-username>.pythonanywhere.com
   ```

Your full Melody Spotify Genre Studio web application will be live for your college project presentation and portfolio!
