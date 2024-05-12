from typing import Annotated

from fastapi import APIRouter, Form
from fastapi.exceptions import HTTPException

from now_and_here import datastore
from now_and_here.datastore.errors import RecordNotFoundError
from now_and_here.models import FEProject
from now_and_here.models.task import FETask

api_router = APIRouter(prefix="/api")


@api_router.get("/tasks")
def get_tasks(
    project_id: str,
    sort_by: str = "due",
    desc: bool = False,
    include_done: bool = False,
) -> list[FETask]:
    store = datastore.get_store()
    tasks = store.get_tasks(
        project_id=project_id,
        include_done=include_done,
        sort_by=sort_by,
        desc=desc,
    )
    return [FETask.from_task(t) for t in tasks]


@api_router.post("/checkoff_task/{id}")
def checkoff_task(id: str) -> FETask:
    store = datastore.get_store()
    try:
        task = store.get_task(id)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")
    task.done = True
    store.checkoff_task(task.id)
    return FETask.from_task(task)


@api_router.post("/uncheckoff_task/{id}")
def uncheckoff_task(id: str) -> FETask:
    store = datastore.get_store()
    try:
        task = store.get_task(id)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")
    task.done = True
    store.uncheckoff_task(task.id)
    return FETask.from_task(task)


@api_router.get("/projects/{id}")
def get_project_by_id(id: str) -> FEProject:
    store = datastore.get_store()
    try:
        project = store.get_project(id)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    return FEProject.from_project(project)


@api_router.post("/tasks/{id}")
def post_task(id: str, done: Annotated[bool | None, Form()] = None) -> FETask:
    store = datastore.get_store()
    try:
        task = store.get_task(id)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")
    return FETask.from_task(task)


@api_router.get("/projects")
def get_projects() -> list[FEProject]:
    store = datastore.get_store()
    projects = store.get_projects()
    projects_with_parents = [FEProject.from_project(p) for p in projects]
    return projects_with_parents
