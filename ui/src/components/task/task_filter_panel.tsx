import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectValue, SelectItem, SelectTrigger, SelectContent } from '@/components/ui/select';
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

export const TaskFilterSchema = z.object({
  sortBy: z.enum(["due", "priority"]),
  desc: z.boolean(),
  includeDone: z.boolean(),
})

interface TaskFilterPanelParams {
  filter: z.infer<typeof TaskFilterSchema>,
  onFilterChange: (filter: z.infer<typeof TaskFilterSchema>) => void,
}

export default function TaskFilterPanel({ filter, onFilterChange }: TaskFilterPanelParams) {
  const form = useForm<z.infer<typeof TaskFilterSchema>>({
    resolver: zodResolver(TaskFilterSchema),
    defaultValues: filter,
  })
  useEffect(() => {
    const subscription = form.watch((value) => {
      const f = { ...filter, ...value }
      onFilterChange(f)
    })
    return () => subscription.unsubscribe()
  }, [form.watch, filter, onFilterChange])
  return (
    <Form {...form}>
      <form>
        <div className="flex flex-row justify-start items-end gap-8 lg:gap-12 py-1">
          { /* <ToggleSortOrder desc={filter.desc} onToggle={(value) => { onFilterChange('desc', value) }} /> */}
          <FormField control={form.control} name="sortBy" render={({ field }) => (
            <FormItem className='flex flex-row items-center gap-2 space-y-0'>
              <FormLabel className='font-normal min-w-16 text-right'>Sorted by</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="..."/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="due">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
          />
          <FormField control={form.control} name="desc" render={({ field }) => (
            <FormItem className='flex flex-row items-center gap-2 space-y-0'>
              <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="..."/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">Ascending</SelectItem>
                  <SelectItem value="true">Descending</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
          />
          <FormField control={form.control} name="includeDone" render={({ field }) => (
            <FormItem className='flex flex-row items-center gap-2 space-y-0'>
              <FormLabel className='font-normal min-w-16 text-right'>Showing</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="..."/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">Incomplete</SelectItem>
                  <SelectItem value="true">All</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
          />
        </div>
      </form>
    </Form>
  );
}
