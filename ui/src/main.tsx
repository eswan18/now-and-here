import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import Projects from "./routes/projects";
import Project from "./routes/project";
import TaskView from "./routes/taskView";
import { TitleProvider } from "./contexts/TitleContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TaskViews from "./routes/taskViews";

const queryClient = new QueryClient();

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
        path: "projects/:projectId",
        element: <Project />,
      },
      {
        path: "task_views",
        element: <TaskViews />,
      },
      {
        path: "task_views/:viewName",
        element: <TaskView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TitleProvider>
        <RouterProvider router={router} />
      </TitleProvider>
      <ToastContainer />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>,
);
