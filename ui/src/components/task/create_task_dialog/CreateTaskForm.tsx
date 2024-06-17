import { useState } from "react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getProjects } from "@/apiServices/project";
import { NewTask, Priority } from "@/types/task";
import PriorityBadge from "../priority_badge";
import { CalendarClock } from "lucide-react";
import { yesterday } from "@/lib/time";

export interface TaskDefaults {
  name?: string;
  description?: string;
  priority?: number;
  projectId?: string;
  due?: Date;
}

interface CreateTaskFormProps {
  onCreateTask: (task: NewTask) => void; // Function to call when a new task is created
  defaults?: TaskDefaults;
}

const CreateTaskFormSchema = z.object({
  name: z.string({
    required_error: "Tasks must have a name",
  }),
  description: z.string().optional(),
  projectId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "null" ? null : val)),
  priority: z.coerce
    .number({
      required_error: "Tasks must have a priority",
    })
    .gte(0)
    .lte(3),
  due: z.date().optional(),
});

export default function CreateTaskForm({
  onCreateTask,
  defaults,
}: CreateTaskFormProps) {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const form = useForm<z.infer<typeof CreateTaskFormSchema>>({
    resolver: zodResolver(CreateTaskFormSchema),
    defaultValues: { priority: 0, ...defaults },
  });
  function onSubmit(data: z.infer<typeof CreateTaskFormSchema>) {
    const task: NewTask = {
      name: data.name,
      description: data.description || null,
      project_id: data.projectId || null,
      priority: data.priority as Priority,
      due: data.due || null,
      done: false,
      parent_id: null,
      labels: [],
      repeat: null,
    };
    onCreateTask(task);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString() || "null"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {projectsQuery.isLoading && "Loading..."}
                  {projectsQuery.isError && "Error loading projects"}
                  {projectsQuery.isSuccess &&
                    projectsQuery.data.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">
                    <PriorityBadge priority={0} />
                  </SelectItem>
                  <SelectItem value="1">
                    <PriorityBadge priority={1} />
                  </SelectItem>
                  <SelectItem value="2">
                    <PriorityBadge priority={2} />
                  </SelectItem>
                  <SelectItem value="3">
                    <PriorityBadge priority={3} />
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="due"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="pr-4">Date</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        `${field.value.toLocaleString([], {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      ) : (
                        <span>Select Due Date</span>
                      )}
                      <CalendarClock className="w-5 h-5 ml-2" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    className="p-0"
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date <= yesterday()}
                    initialFocus
                  />
                  <Input
                    type="time"
                    className="mt-2"
                    // take locale date time string in format that the input expects (24hr time)
                    value={field.value?.toLocaleTimeString([], {
                      hourCycle: "h23",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    // take hours and minutes and update our Date object then change date object to our new value
                    onChange={(selectedTime) => {
                      const currentTime = field.value;
                      currentTime?.setHours(
                        parseInt(selectedTime.target.value.split(":")[0]),
                        parseInt(selectedTime.target.value.split(":")[1]),
                        0,
                      );
                      field.onChange(currentTime);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
