import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn, ControllerRenderProps } from "react-hook-form";
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

  const defaultClass = "w-full flex flex-row items-start gap-x-8";
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
            <TaskFilterFormSelect
              field={field}
              label="Sorted by"
              items={[
                { value: "due", label: "due date" },
                { value: "priority", label: "priority" },
              ]}
            />
          )}
        />
        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <TaskFilterFormItem>
              <FormLabel className="font-normal ">Descending</FormLabel>
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
            <TaskFilterFormSelect
              field={field}
              label="Showing"
              items={[
                { value: "false", label: "incomplete tasks" },
                { value: "true", label: "all tasks" },
              ]}
            />
          )}
        />
        <FormField
          control={form.control}
          name="includeChildProjects"
          render={({ field }) => (
            <TaskFilterFormSelect
              field={field}
              label="in"
              items={[
                { value: "false", label: "this project" },
                { value: "true", label: "this & child projects" },
              ]}
            />
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
    <div className="grid grid-flow-col grid-cols-[auto auto] gap-x-3 text-gray-400">
      {children}
    </div>
  );
}

interface TaskFilterFormItemProps {
  children: React.ReactNode;
}

function TaskFilterFormItem({ children }: TaskFilterFormItemProps) {
  return (
    <FormItem className="flex flex-row items-center gap-x-2 space-y-0 justify-between min-w-fit">
      {children}
    </FormItem>
  );
}

interface TaskFilterFormSelectProps<
  T extends keyof z.infer<typeof TaskFilterSchema>,
> {
  field: ControllerRenderProps<z.infer<typeof TaskFilterSchema>, T>;
  label: string;
  items: { value: string; label: string }[];
}

function TaskFilterFormSelect<
  T extends keyof z.infer<typeof TaskFilterSchema>,
>({ field, label, items }: TaskFilterFormSelectProps<T>) {
  return (
    <TaskFilterFormItem>
      <FormLabel className="font-normal flex-shrink-0">{label}</FormLabel>
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
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </TaskFilterFormItem>
  );
}
