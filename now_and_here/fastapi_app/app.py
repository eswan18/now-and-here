import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .api import api_router

TEMPLATE_DIR = Path(__file__).parent / "templates"
UI_DIR = Path(__file__).parent / "ui"
ASSETS_DIR = UI_DIR / "assets"

NH_BUILD_TW = os.getenv("NH_BUILD_TW") in ("1", "True", "true")

app = FastAPI()
templates = Jinja2Templates(directory=TEMPLATE_DIR)
ui_templates = Jinja2Templates(directory=UI_DIR)
app.mount("/assets", StaticFiles(directory=ASSETS_DIR, html=True), name="assets")
app.include_router(api_router)


@app.get("/app/{rest_of_path:path}", response_class=templates.TemplateResponse)
async def react_app(req: Request, rest_of_path: str):
    """Route all other paths to the React app."""
    # Strip the "/app" from the request path before sending it onward.
    return ui_templates.TemplateResponse("index.html", {"request": req})
