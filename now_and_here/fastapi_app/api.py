from typing import Annotated

from fastapi import APIRouter, Form

from now_and_here import datastore
from now_and_here.datastore.errors import RecordNotFoundError
from now_and_here.models import Project
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


@api_router.post("/tasks/{id}")
def post_task(id: str, done: Annotated[bool | None, Form()] = None):
    store = datastore.get_store()
    try:
        task = store.get_task(id)
    except RecordNotFoundError:
        return 404, "Task not found"
    return task


@api_router.get("/projects/{id}")
def get_project_by_id(id: str) -> Project:
    store = datastore.get_store()
    try:
        project = store.get_project(id)
    except RecordNotFoundError:
        return 404, "Project not found"
    return project
