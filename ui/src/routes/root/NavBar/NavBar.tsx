import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "../Sidebar";
import SearchMenu from "./SearchMenu";

export default function NavBar() {
  return (
    <div className="w-full flex flex-row justify-between items-center pl-1 lg:pl-8 pr-3 h-12 bg-white border-b">
      <div className="flex flex-row items-center justify-start gap-2">
        <Sheet>
          <SheetTrigger>
            <Button size="sm" variant="ghost" className="inline md:hidden px-2">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-base lg:text-lg font-bold text-orange-800">
          <Link to="/">Now and Here</Link>
        </h1>
      </div>
      <SearchMenu />
    </div>
  );
}
