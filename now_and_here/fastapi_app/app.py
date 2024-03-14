import subprocess
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from now_and_here.datastore import get_store
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
                "now_and_here/fastapi_app/static/css/main.css" "--minify",
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
def tasks(request: Request, id: str):
    store = get_store()
    try:
        task = store.get_task(id)
        print(task)
    except RecordNotFoundError:
        return 404, "Task not found"
    return templates.TemplateResponse("task.html", {"request": request, "task": task})
