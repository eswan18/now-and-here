import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import Root from "./routes/root";
import ErrorPage from "./error-page";
import Projects from "./routes/projects";
import Project from "./routes/project";
import { TitleProvider } from './contexts/TitleContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "/projects/:projectId",
        element: <Project />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TitleProvider>
      <RouterProvider router={router} />
    </TitleProvider>
  </React.StrictMode>,
)
