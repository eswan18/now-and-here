# Now and Here

## Getting Started

```bash
# Initialize datastore
nh init
# Start the web UI
nh web
```

## Basic Architecture
Overview:
- Datastore: **sqlite** (including vector store)
- Data "Controller" & Backend API: **Python**, **fastapi**
- Frontend: **React**

The bundled frontend application is hosted by the backend via a catchall API endpoint.
This is accomplished by building the React app and bundling it into the Python package, in `now_and_here/fastapi_app/ui/`.

Building the React app is done with `npm run build` from within the `ui` folder;
that command will automatically saves its output bundle to the right place inside the Python package.

## Development Workflow

Manually rebuilding the React app after each change is cumbersome.
Thankfully there's an alternative approach for development: starting a dev instance of the React app (with hot reloading) that connects to the existing Python API.

This is done by running `poetry shell` and then `npm run nh-dev` from within the `ui` directory.
Here's what that does.

1. Creates and enters a new shell session where `nh` points to the entrypoint of the Python package in this directory, so it will reflect any local changes.
2. Starts the fastapi app using `nh web` (at the regular location, `localhost:8787`), but with proper CORS settings to enable requests from `localhost:5173`
3. Starts a development server with the React app at `localhost:5173`, configured to make requests to `localhost:8787`. (The default is to make API requests to the same URL as the frontend is hosted at.)

A live-updating UI – connected to the backend API – will then be available in the browser at `http://localhost:5173`.