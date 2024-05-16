import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getProjects } from "@/apiServices/project";
import { NewTask } from "@/types/task";
import PriorityBadge from "../priority_badge";

export interface TaskDefaults {
  name?: string;
  description?: string;
  due?: string;
  priority?: number;
  projectId?: string;
}

interface CreateTaskFormProps {
  onCreateTask: (task: NewTask) => void; // Function to call when a new task is created
  defaults?: TaskDefaults;
}

const CreateTaskFormSchema = z.object({
  name: z
    .string({
      required_error: "Tasks must have a name",
    }),
  description: z.string().optional(),
  projectId: z.string().optional().nullable().transform((val) => val === "null" ? null : val),
  priority: z.coerce.number({
    required_error: "Tasks must have a priority",
  }).gte(0).lte(3),
})

export default function CreateTaskForm({ onCreateTask, defaults }: CreateTaskFormProps) {
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });
  const form = useForm<z.infer<typeof CreateTaskFormSchema>>({
    resolver: zodResolver(CreateTaskFormSchema),
    defaultValues: { priority: 0, ...defaults },
  })
  function onSubmit(data: z.infer<typeof CreateTaskFormSchema>) {
    const task: NewTask = {
      name: data.name,
      description: data.description || null,
      project_id: data.projectId || null,
      priority: data.priority,
      due: null,
      done: false,
      parent_id: null,
      labels: [],
      repeat: null,
    }
    onCreateTask(task);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />
        <FormField control={form.control} name="projectId" render={({ field }) => (
          <FormItem>
            <FormLabel>Project</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value?.toString() || "null"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="null">None</SelectItem>
                {projectsQuery.isLoading && "Loading..."}
                {projectsQuery.isError && "Error loading projects"}
                {projectsQuery.isSuccess && projectsQuery.data.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
        />
        <FormField control={form.control} name="priority" render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0"><PriorityBadge priority={0} /></SelectItem>
                <SelectItem value="1"><PriorityBadge priority={1} /></SelectItem>
                <SelectItem value="2"><PriorityBadge priority={2} /></SelectItem>
                <SelectItem value="3"><PriorityBadge priority={3} /></SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form >
  )

}