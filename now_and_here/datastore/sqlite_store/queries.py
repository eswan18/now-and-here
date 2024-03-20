PROJECTS_HIERARCHY_CTE = """
-- Initial query: Select all projects and their immediate parent ID
SELECT p.id, p.json
FROM projects p
WHERE p.json ->> '$.parent' IS NULL
UNION ALL

-- Recursive query: Get parent projects, linking through the parent_id
SELECT p2.id, json_set(
    p2.json,
    '$.parent',
    json(ph.json)
) as json
FROM projects p2
JOIN project_hierarchy ph ON p2.json ->> '$.parent' = ph.id
"""

TASKS_QUERY = f"""
WITH RECURSIVE project_hierarchy(id, json) AS ({PROJECTS_HIERARCHY_CTE})
SELECT 
    json_set(
        t.json,
        '$.project',
        json(ph.json)
    )
FROM tasks t
LEFT JOIN project_hierarchy ph
    ON t.json ->> 'project' = ph.id
WHERE 1=1
"""

PROJECTS_QUERY = f"""
WITH RECURSIVE project_hierarchy(id, json) AS ({PROJECTS_HIERARCHY_CTE})
SELECT json
FROM project_hierarchy ph
WHERE 1 = 1
"""
