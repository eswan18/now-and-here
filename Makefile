lint:
	ruff check

typecheck:
	mypy now_and_here

format:
	ruff format

test:
	pytest

css:
	tailwindcss -i ./now_and_here/fastapi_app/static/src/tw.css -o ./now_and_here/fastapi_app/static/css/main.css --minify

check: lint typecheck test