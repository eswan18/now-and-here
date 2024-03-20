from now_and_here.datastore import UnstructuredSQLiteStore
from now_and_here.models import Project


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

    # Get all projects and be sure they match.
    retrieved_projects = temp_unstructured_sqlite_store.get_projects()
    projects = sorted(projects, key=lambda p: p.id)
    retrieved_projects = sorted(retrieved_projects, key=lambda p: p.id)
    assert [p.id for p in projects] == [p.id for p in retrieved_projects]
    for project, retrieved_project in zip(projects, retrieved_projects):
        assert project == retrieved_project
