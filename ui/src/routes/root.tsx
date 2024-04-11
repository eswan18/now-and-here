import { Outlet, Link } from "react-router-dom";

export default function Root() {
  return (
    <div className="flex flex-col justify-start w-full min-h-screen bg-gray-50">
      <div className="w-full px-4 h-10">
        <div className="flex flex-row justify-between items-center h-full w-full px-4 lg:px-8">
          <h1 className="text-base lg:text-lg font-bold text-orange-800"><Link to="/">Now and Here</Link></h1>
          <div className="text-sm lg:text-base flex flex-row text-orange-900 gap-4">
            <a href="#">Projects</a>
            <a href="#">Views</a>
          </div>
        </div>
      </div>
      <div className="w-full h-16 lg:h-28 lg:py-4 bg-orange-800">
        <div className="lg:max-w-[60rem] mx-auto p-4 lg:p-8 text-orange-50" id="headerContainer">
          <Outlet />
        </div>
      </div>
      <div className="w-full">
        <div className="lg:max-w-[60rem] mx-auto px-4 lg:px-8" id="mainContentContainer">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
