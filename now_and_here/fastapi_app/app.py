import os
import subprocess
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from now_and_here import datastore
from now_and_here.datastore.errors import RecordNotFoundError

TEMPLATE_DIR = Path(__file__).parent / "templates"
UI_DIR = Path(__file__).parent / "ui"
ASSETS_DIR = UI_DIR / "assets"

NH_BUILD_TW = os.getenv("NH_BUILD_TW") in ("1", "True", "true")

app = FastAPI()
templates = Jinja2Templates(directory=TEMPLATE_DIR)
ui_templates = Jinja2Templates(directory=UI_DIR)
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


@app.get("/api/tasks/{id}", response_class=HTMLResponse)
def get_task(request: Request, id: str):
    store = datastore.get_store()
    try:
        task = store.get_task(id)
        print(task)
    except RecordNotFoundError:
        return 404, "Task not found"
    return templates.TemplateResponse("task.html", {"request": request, "task": task})


@app.post("/api/tasks/{id}")
def post_task(id: str, done: Annotated[bool | None, Form()] = None):
    print(done)
    store = datastore.get_store()
    try:
        task = store.get_task(id)
        print(task)
    except RecordNotFoundError:
        return 404, "Task not found"
    return None


@app.get("/api/projects", response_class=HTMLResponse)
def projects(request: Request):
    store = datastore.get_store()
    projects = store.get_projects()
    return templates.TemplateResponse(
        "projects.html", {"request": request, "projects": projects}
    )


@app.get("/api/projects/{id}", response_class=HTMLResponse)
def project(
    request: Request,
    id: str,
    sort_by: str = "due",
    desc: bool = False,
    include_done: bool = False,
):
    store = datastore.get_store()
    try:
        project = store.get_project(id)
        tasks = store.get_tasks(
            project_id=id,
            include_done=include_done,
            sort_by=sort_by,
            desc=desc,
        )
    except RecordNotFoundError:
        return 404, "Project not found"
    return templates.TemplateResponse(
        "project.html",
        {
            "request": request,
            "project": project,
            "tasks": tasks,
            "sort_by": sort_by,
            "include_done": include_done,
            "desc": desc,
        },
    )


@app.get("/api/task_views/today", response_class=HTMLResponse)
def view_today(
    request: Request,
    sort_by: str = "due",
    desc: bool = False,
    include_done: bool = False,
):
    store = datastore.get_store()
    end_of_today = datetime.now().replace(hour=23, minute=59, second=59)
    tasks = store.get_tasks(
        sort_by=sort_by, desc=desc, include_done=include_done, due_before=end_of_today
    )
    return templates.TemplateResponse(
        "task_view.html",
        {
            "request": request,
            "title": "Today",
            "subtitle": "Tasks due by the end the day",
            "tasks": tasks,
            "sort_by": sort_by,
            "include_done": include_done,
            "desc": desc,
        },
    )


@app.get("/{rest_of_path:path}", response_class=templates.TemplateResponse)
async def react_app(req: Request, rest_of_path: str):
    return ui_templates.TemplateResponse('index.html', { 'request': req })