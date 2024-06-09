import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { useTitle } from "@/contexts/TitleContext";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

export default function Root() {
  const { pageTitle } = useTitle();

  useEffect(() => {
    // This will update the browser tab title.
    document.title = `Now and Here: ${pageTitle}`;
  }, [pageTitle]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <NavBar />
      <div className="w-full flex-1 flex flex-row lg:justify-start">
        <div className="hidden md:block w-72 min-h-full flex-shrink-0 border-r px-10 bg-white">
          <Sidebar />
        </div>
        <div className="flex-shrink-1 w-full lg:max-w-[60rem] mx-auto px-4 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
