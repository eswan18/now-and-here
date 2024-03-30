import os
import subprocess
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from now_and_here import datastore
from now_and_here.datastore.errors import RecordNotFoundError

TEMPLATE_DIR = Path(__file__).parent / "templates"
STATIC_DIR = Path(__file__).parent / "static"

NH_BUILD_TW = os.getenv("NH_BUILD_TW") in ("1", "True", "true")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Context manager for FastAPI app. It will run all code before `yield`
    on app startup, and will run code after `yield` on app shutdown.
    """
    if NH_BUILD_TW:
        print("Running tailwindcss...")
        subprocess.run(
            [
                "tailwindcss",
                "-i",
                STATIC_DIR / "src" / "tw.css",
                "-o",
                STATIC_DIR / "css" / "main.css",
                "--minify",
            ]
        )
        print("done")
    yield


app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory=TEMPLATE_DIR)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=RedirectResponse)
def index(request: Request):
    # Redirect to /projects
    return RedirectResponse(url="/projects")


@app.get("/tasks/{id}", response_class=HTMLResponse)
def get_task(request: Request, id: str):
    store = datastore.get_store()
    try:
        task = store.get_task(id)
        print(task)
    except RecordNotFoundError:
        return 404, "Task not found"
    return templates.TemplateResponse("task.html", {"request": request, "task": task})


@app.post("/tasks/{id}")
def post_task(id: str, done: Annotated[bool | None, Form()] = None):
    print(done)
    store = datastore.get_store()
    try:
        task = store.get_task(id)
        print(task)
    except RecordNotFoundError:
        return 404, "Task not found"
    return None


@app.get("/projects", response_class=HTMLResponse)
def projects(request: Request):
    store = datastore.get_store()
    projects = store.get_projects()
    return templates.TemplateResponse(
        "projects.html", {"request": request, "projects": projects}
    )


@app.get("/projects/{id}", response_class=HTMLResponse)
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
