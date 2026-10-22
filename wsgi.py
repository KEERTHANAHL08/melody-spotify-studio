import sys
import os

# Set up paths for PythonAnywhere
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

backend_path = os.path.join(project_home, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from a2wsgi import ASGIMiddleware
from app import app, init_app_state

# Ensure pipeline is initialized
init_app_state()

# Standard WSGI entry point for PythonAnywhere
application = ASGIMiddleware(app)
