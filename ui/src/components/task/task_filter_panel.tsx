import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { ListFilter, ArrowDownUp } from "lucide-react";

import {
  Select,
  SelectValue,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export const TaskFilterSchema = z.object({
  sortBy: z.enum(["due", "priority"]),
  desc: z.boolean(),
  includeDone: z.boolean(),
  includeChildProjects: z.boolean(),
});

interface TaskFilterPanelParams {
  filter: z.infer<typeof TaskFilterSchema>;
  onFilterChange: (filter: z.infer<typeof TaskFilterSchema>) => void;
}

export default function TaskFilterPanel({
  filter,
  onFilterChange,
}: TaskFilterPanelParams) {
  const form = useForm<z.infer<typeof TaskFilterSchema>>({
    resolver: zodResolver(TaskFilterSchema),
    defaultValues: filter,
  });
  const formWatcher = form.watch;
  useEffect(() => {
    const subscription = formWatcher((value) => {
      const f = { ...filter, ...value };
      onFilterChange(f);
    });
    return () => subscription.unsubscribe();
  }, [formWatcher, filter, onFilterChange]);

  return (
    <Form {...form}>
      <form>
        <div className="w-full px-6 lg:px-10 mb-4 lg:mb-8 flex flex-row flex-wrap justify-between items-center gap-4 lg:gap-x-8">
          <SortFormFields form={form} />
          <FilterFormFields form={form} />
        </div>
      </form>
    </Form>
  );
}

function SortFormFields({
  form,
}: {
  form: UseFormReturn<z.infer<typeof TaskFilterSchema>>;
}) {
  return (
    <div className="flex flex-row items-center justify-start mx-4 gap-2 text-gray-400">
      <ArrowDownUp size={24} />
      <FormField
        control={form.control}
        name="sortBy"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0 w-[9.5rem]">
            <FormLabel className="font-normal min-w-16 text-right">
              Sorted by
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value.toString()}
            >
              <FormControl>
                <SelectTrigger className="border-0 px-0 h-6 w-auto bg-inherit text-gray-900">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="due">due date</SelectItem>
                <SelectItem value="priority">priority</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="desc"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0">
            <FormLabel className="font-normal">Descending</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function FilterFormFields({
  form,
}: {
  form: UseFormReturn<z.infer<typeof TaskFilterSchema>>;
}) {
  return (
    <div className="flex flex-row items-center justify-start mx-4 gap-2 text-gray-400">
      <ListFilter size={24} />
      <FormField
        control={form.control}
        name="includeDone"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0 w-[9.5rem]">
            <FormLabel className="font-normal text-right">Showing</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value.toString()}
            >
              <FormControl>
                <SelectTrigger className="border-0 px-0 h-6 w-auto bg-inherit text-gray-900">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="false">incomplete</SelectItem>
                <SelectItem value="true">all tasks</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="includeChildProjects"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0">
            <FormLabel className="font-normal text-right">in</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value.toString()}
            >
              <FormControl>
                <SelectTrigger className="border-0 px-0 h-6 bg-inherit text-gray-900">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="false">this project</SelectItem>
                <SelectItem value="true">this & child projects</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
