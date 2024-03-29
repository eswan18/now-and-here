import subprocess
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from now_and_here import datastore
from now_and_here.datastore.errors import RecordNotFoundError

TEMPLATE_DIR = Path(__file__).parent / "templates"
STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Context manager for FastAPI app. It will run all code before `yield`
    on app startup, and will run code after `yield` on app shutdown.
    """
    try:
        print("Running tailwindcss...")
        subprocess.run(
            [
                "tailwindcss",
                "-i",
                "now_and_here/fastapi_app/static/src/tw.css",
                "-o",
                "now_and_here/fastapi_app/static/css/main.css",
                "--minify",
            ]
        )
        print("done")
    except Exception as e:
        print("Error running tailwindcss...")
        raise e
    yield


app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory=TEMPLATE_DIR)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})


@app.get("/task/{id}", response_class=HTMLResponse)
def get_task(request: Request, id: str):
    store = datastore.get_store()
    try:
        task = store.get_task(id)
        print(task)
    except RecordNotFoundError:
        return 404, "Task not found"
    return templates.TemplateResponse("task.html", {"request": request, "task": task})


@app.post("/task/{id}")
def post_task(id: str, done: Annotated[bool | None, Form()] = None):
    print(done)
    store = datastore.get_store()
    try:
        task = store.get_task(id)
        print(task)
    except RecordNotFoundError:
        return 404, "Task not found"
    return None


@app.get("/project/{id}", response_class=HTMLResponse)
def project(request: Request, id: str, sort_by: str = "due", desc: bool = False):
    store = datastore.get_store()
    try:
        project = store.get_project(id)
        tasks = store.get_tasks(
            project_id=id, include_done=True, sort_by=sort_by, desc=desc
        )
    except RecordNotFoundError:
        return 404, "Project not found"
    return templates.TemplateResponse(
        "project.html",
        {"request": request, "project": project, "tasks": tasks, "sort_by": sort_by},
    )
