import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useDebounce } from "@uidotdev/usehooks";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { searchTasks } from "@/apiServices/task";
import TaskCard from "@/components/task/task_card";
import { Task } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskCardList from "@/components/task/task_card_list";

export default function NavBar() {
  return (
    <div className="w-full px-4 h-10 bg-white border-b">
      <div className="flex flex-row justify-between items-center h-full w-full px-4 lg:px-8">
        <h1 className="text-base lg:text-lg font-bold text-orange-800">
          <Link to="/">Now and Here</Link>
        </h1>
        <SearchMenu />
      </div>
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
  return <TaskCard task={task} onToggleCompletion={() => {}} />;
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
          <TaskCardList tasks={data} onCompletionToggle={() => {}} />
        )}
      </ScrollArea>
    </div>
  );
}
