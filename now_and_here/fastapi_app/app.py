from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .api import api_router

UI_DIR = Path(__file__).parent / "ui"
ASSETS_DIR = UI_DIR / "assets"

app = FastAPI()
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")
app.include_router(api_router)
# Important: this *must* be placed after the `include_router` call for the catchall
# route (below) to work.
ui_templates = Jinja2Templates(directory=UI_DIR)


@app.get("/{_rest_of_path:path}")
async def react_app(req: Request, _rest_of_path: str):
    """Route all other paths to the React app."""
    return ui_templates.TemplateResponse("index.html", {"request": req})
