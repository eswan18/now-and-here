import typer

from now_and_here.models.task import Task
from .common import get_store
from .console import console


task_app = typer.Typer(
    help="Manage tasks.",
    no_args_is_help=True,
)


@task_app.command()
def list():
    """List all tasks."""
    store = get_store()
    tasks = store.get_all_tasks()
    console.print(Task.as_rich_table(tasks))


@task_app.command()
def add(interactive: bool = typer.Option(False, "--interactive", "-i")):
    """Add a task."""
    if not interactive:
        raise typer.BadParameter("Only interactive mode is supported for now.")
    task = Task.from_prompt(console)
    with console.status("Saving..."):
        store = get_store()
        store.save_task(task)
    console.print("Task saved")


@task_app.command()
def delete(id: str):
    """Delete a task."""
    store = get_store()
    if store.delete_task(id):
        console.print("Task deleted")
    else:
        console.print("Task not found")
