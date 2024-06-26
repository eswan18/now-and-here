from fastapi import APIRouter, Body
from fastapi.exceptions import HTTPException

from now_and_here import datastore
from now_and_here.datastore.errors import RecordNotFoundError
from now_and_here.models import FEProject
from now_and_here.models.task import FENewTaskIn, FETaskOut
from now_and_here.models.user_context import UserContextFE
from now_and_here.views.task_views import TaskView, task_views

api_router = APIRouter(prefix="/api")


@api_router.get("/tasks")
def get_tasks(
    project_id: str,
    include_child_projects: bool = False,
    sort_by: str = "due",
    desc: bool = False,
    include_done: bool = False,
) -> list[FETaskOut]:
    store = datastore.get_store()
    tasks = store.get_tasks(
        project_id=project_id,
        include_child_projects=include_child_projects,
        include_done=include_done,
        sort_by=sort_by,
        desc=desc,
    )
    return [FETaskOut.from_task(t) for t in tasks]


@api_router.post("/checkoff_task/{id}")
def checkoff_task(id: str) -> FETaskOut:
    store = datastore.get_store()
    try:
        task = store.get_task(id)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")
    task.done = True
    store.checkoff_task(task.id)
    return FETaskOut.from_task(task)


@api_router.post("/uncheckoff_task/{id}")
def uncheckoff_task(id: str) -> FETaskOut:
    store = datastore.get_store()
    try:
        task = store.get_task(id)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")
    task.done = True
    store.uncheckoff_task(task.id)
    return FETaskOut.from_task(task)


@api_router.get("/projects/{id}")
def get_project_by_id(id: str) -> FEProject:
    store = datastore.get_store()
    try:
        project = store.get_project(id)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    return FEProject.from_project(project)


@api_router.post("/tasks")
def create_task(task: FENewTaskIn) -> FETaskOut:
    store = datastore.get_store()
    backend_task = task.to_task(store=store)
    store.save_task(backend_task)
    return FETaskOut.from_task(backend_task)


@api_router.get("/projects")
def get_projects() -> list[FEProject]:
    store = datastore.get_store()
    projects = store.get_projects()
    projects_with_parents = [FEProject.from_project(p) for p in projects]
    return projects_with_parents


@api_router.get("/task_views")
def get_task_views() -> list[TaskView]:
    """Get a list of available task views."""
    return sorted(list(task_views.values()), key=lambda v: v.name)


@api_router.get("/task_views/{name}")
def get_task_view(name: str) -> TaskView:
    """Get a specific task view."""
    try:
        return task_views[name]
    except KeyError:
        raise HTTPException(status_code=404, detail=f"View '{name}' not found")


@api_router.post("/task_views/build")
def build_task_view(
    view_name: str = Body(), context: UserContextFE = Body()
) -> list[FETaskOut]:
    """Get a specific view of tasks."""
    try:
        view = task_views[view_name]
    except KeyError:
        raise HTTPException(status_code=404, detail=f"View '{view_name}' not found")
    user_context = context.to_user_context()
    store = datastore.get_store()
    tasks = view.build(store, user_context)
    return [FETaskOut.from_task(t) for t in tasks]


@api_router.post("/tasks/search")
def search_tasks(query: str = Body(..., embed=True)) -> list[FETaskOut]:
    """Search for tasks."""
    store = datastore.get_store()
    tasks = store.search_tasks(query)
    return [FETaskOut.from_task(t) for t in tasks]


@api_router.put("/tasks/{id}")
def update_task(id: str, task: FENewTaskIn) -> FETaskOut:
    store = datastore.get_store()
    as_backend_task = task.to_task(store=store)
    as_backend_task.id = id
    try:
        store.update_task(id, as_backend_task)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")
    return FETaskOut.from_task(as_backend_task)
