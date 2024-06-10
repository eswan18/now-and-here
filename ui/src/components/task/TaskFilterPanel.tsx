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
import { cn } from "@/lib/utils";

export const TaskFilterSchema = z.object({
  sortBy: z.enum(["due", "priority"]),
  desc: z.boolean(),
  includeDone: z.boolean(),
  includeChildProjects: z.boolean(),
});

interface TaskFilterPanelParams {
  filter: z.infer<typeof TaskFilterSchema>;
  onFilterChange: (filter: z.infer<typeof TaskFilterSchema>) => void;
  className?: string;
}

export default function TaskFilterPanel({
  filter,
  onFilterChange,
  className,
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

  const defaultClass = "w-full flex flex-row items-start gap-6";
  const finalClass = cn(defaultClass, className);
  return (
    <Form {...form}>
      <form>
        <div className={finalClass}>
          <FilterFormFields form={form} />
          <SortFormFields form={form} />
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
    <TaskFilterFormFieldsContainer>
      <ArrowDownUp size={24} />
      <div className="flex flex-col gap-y-1">
        <FormField
          control={form.control}
          name="sortBy"
          render={({ field }) => (
            <TaskFilterFormItem>
              <FormLabel className="font-normal">Sorted by</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className="border-0 px-0 h-6 w-auto bg-inherit font-medium">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="due">due date</SelectItem>
                  <SelectItem value="priority">priority</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </TaskFilterFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <TaskFilterFormItem>
              <FormLabel className="font-normal">Descending</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </TaskFilterFormItem>
          )}
        />
      </div>
    </TaskFilterFormFieldsContainer>
  );
}

function FilterFormFields({
  form,
}: {
  form: UseFormReturn<z.infer<typeof TaskFilterSchema>>;
}) {
  return (
    <TaskFilterFormFieldsContainer>
      <ListFilter size={24} />
      <div className="flex flex-col gap-y-1">
        <FormField
          control={form.control}
          name="includeDone"
          render={({ field }) => (
            <TaskFilterFormItem>
              <FormLabel className="font-normal text-right">Showing</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className="border-0 px-0 h-6 w-auto bg-inherit font-medium">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">incomplete</SelectItem>
                  <SelectItem value="true">all tasks</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </TaskFilterFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="includeChildProjects"
          render={({ field }) => (
            <TaskFilterFormItem>
              <FormLabel className="font-normal text-right">in</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className="border-0 px-0 h-6 bg-inherit justify-end font-medium">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">this project</SelectItem>
                  <SelectItem value="true">this & child projects</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </TaskFilterFormItem>
          )}
        />
      </div>
    </TaskFilterFormFieldsContainer>
  );
}

interface TaskFilterFormFieldsContainerProps {
  children: React.ReactNode;
}
function TaskFilterFormFieldsContainer({
  children,
}: TaskFilterFormFieldsContainerProps) {
  return (
    <div className="grid grid-cols-[1rem_1fr] gap-x-5 text-gray-400">
      {children}
    </div>
  );
}

interface TaskFilterFormItemProps {
  children: React.ReactNode;
}

function TaskFilterFormItem({ children }: TaskFilterFormItemProps) {
  return (
    <FormItem className="flex flex-row items-center gap-x-2 space-y-0 justify-between">
      {children}
    </FormItem>
  );
}
