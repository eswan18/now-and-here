lint:
	ruff check

typecheck:
	mypy now_and_here tests

format:
	ruff format

test:
	pytest

check: lint typecheck test

dev:
	$(MAKE) -j 2 dev-parallel

dev-parallel: backend dev-frontend

backend:
	nh web

dev-frontend:
	cd ui && VITE_API_BASE_URL=http://localhost:8787 npm run dev
