lint:
	ruff check

typecheck:
	mypy now_and_here tests

format:
	ruff format

test:
	pytest

check: lint typecheck test
