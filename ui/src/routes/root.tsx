import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { useTitle } from "@/contexts/TitleContext";
import NavBar from "@/components/navBar";

export default function Root() {
  const { pageTitle } = useTitle();

  useEffect(() => {
    // This will update the browser tab title.
    document.title = `Now and Here: ${pageTitle}`;
  }, [pageTitle]);

  return (
    <div className="flex flex-col justify-start w-full min-h-screen bg-gray-50">
      <NavBar />
      <div className="w-full">
        <div className="lg:max-w-[60rem] mx-auto px-4 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
