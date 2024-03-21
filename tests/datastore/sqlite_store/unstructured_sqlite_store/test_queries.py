from datetime import datetime

from zoneinfo import ZoneInfo

from now_and_here.datastore import UnstructuredSQLiteStore
from now_and_here.models import Project, Task


def test_save_and_get_projects(temp_unstructured_sqlite_store: UnstructuredSQLiteStore):
    work = Project(name="Work", description="Stuff at work", parent=None)
    misc = Project(name="Misc", description="Uncategorized stuff at work", parent=work)
    team = Project(name="Team", description="Stuff for my team at work", parent=work)
    team_proj1 = Project(
        name="Team Project 1", description="Project 1 for my team at work", parent=team
    )
    team_proj2 = Project(
        name="Team Project 2", description="Project 2 for my team at work", parent=team
    )
    nonwork = Project(name="Non-Work", description="Stuff not at work", parent=None)

    # Save all these projects.
    projects = [work, misc, team, team_proj1, team_proj2, nonwork]
    for project in projects:
        temp_unstructured_sqlite_store.save_project(project)

    # Retrieve all projects and be sure they match.
    retrieved_projects = temp_unstructured_sqlite_store.get_projects()
    projects = sorted(projects, key=lambda p: p.id)
    retrieved_projects = sorted(retrieved_projects, key=lambda p: p.id)
    assert [p.id for p in projects] == [p.id for p in retrieved_projects]
    for project, retrieved_project in zip(projects, retrieved_projects):
        assert project == retrieved_project


def test_save_and_get_tasks(temp_unstructured_sqlite_store: UnstructuredSQLiteStore):
    # Create some projects for us to add tasks to.
    work = Project(name="Work", description="Stuff at work", parent=None)
    misc = Project(name="Misc", parent=work)
    team = Project(name="Team", parent=work)
    team_proj1 = Project(name="Team Project 1", parent=team)
    team_proj2 = Project(name="Team Project 2", parent=team)
    nonwork = Project(name="Non-Work", parent=None)

    # Save all these projects.
    projects = [work, misc, team, team_proj1, team_proj2, nonwork]
    for project in projects:
        temp_unstructured_sqlite_store.save_project(project)

    work_task = Task(name="Work Task", description="Task at work", project=work)
    misc_task = Task(name="Misc Task", description="Uncategorized task", project=misc)
    team_task = Task(name="Team Task", description="Task for my team", project=team)
    team_proj1_task = Task(
        name="Project 1 Task",
        description="team1",
        project=team_proj1,
        done=True,
        due=datetime(2024, 1, 1, 9, 0, 0, tzinfo=ZoneInfo("America/Chicago")),
    )
    team_proj2_task = Task(name="Project 2 Task", project=team_proj2)
    nonwork_task = Task(name="Non-Work Task", description="not work", project=nonwork)

    # Save all these tasks.
    tasks = [
        work_task,
        misc_task,
        team_task,
        team_proj1_task,
        team_proj2_task,
        nonwork_task,
    ]
    for task in tasks:
        temp_unstructured_sqlite_store.save_task(task)

    # Retrieve all tasks and be sure they match.
    retrieved_tasks = temp_unstructured_sqlite_store.get_tasks(include_done=True)
    tasks = sorted(tasks, key=lambda t: t.id)
    retrieved_tasks = sorted(retrieved_tasks, key=lambda t: t.id)
    assert [t.id for t in tasks] == [t.id for t in retrieved_tasks]
    for task, retrieved_task in zip(tasks, retrieved_tasks):
        assert task == retrieved_task
