import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useDebounce } from "@uidotdev/usehooks";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { searchTasks } from "@/apiServices/task";
import TaskListItem from "@/components/task/TaskListItem";
import { Task } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskList from "@/components/task/TaskList";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "../Sidebar";

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

function SearchMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Catch "/" key press to open search dialog.
    const down = (e: KeyboardEvent) => {
      if (e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return (
    <div className="flex flex-row items-center space-x-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="relative h-8 w-full justify-end rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none md:w-32 lg:w-48"
          >
            <span className="hidden lg:inline-flex">Press</span>
            <kbd className="mx-0.5 pointer-events-none top-[0.3rem] flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">/</span>
            </kbd>
            <span className="hidden lg:inline-flex">to search tasks</span>
            <span className="hidden sm:inline-flex lg:hidden">to search</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <SearchDialog />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TaskCommandItem({ task }: { task: Task }) {
  return <TaskListItem task={task} onToggleCompletion={() => {}} />;
}

function SearchDialog() {
  const [query, setQuery] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  const debouncedQuery = useDebounce(query, 500);
  const { data } = useQuery({
    queryKey: ["tasks", "query", debouncedQuery],
    queryFn: () => searchTasks(debouncedQuery),
    enabled: debouncedQuery !== "",
  });
  return (
    <div className="flex flex-col items-center justify-start gap-y-4 w-full h-max">
      <div className="flex flex-row gap-x-4 justify-between items-center w-max mx-4">
        <Search size={32} />
        <Input placeholder="Search tasks..." onChange={handleChange} />
      </div>
      <ScrollArea className="px-2 lg:px-4">
        {data && data.length > 0 && (
          <TaskList tasks={data} onCompletionToggle={() => {}} />
        )}
      </ScrollArea>
    </div>
  );
}
