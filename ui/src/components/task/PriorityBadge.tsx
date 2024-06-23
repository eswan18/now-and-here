import { Badge } from "@/components/ui/badge";
import { Priority } from "@/types/task";
import { TriangleAlert } from "lucide-react";

interface PriorityBadgeProps {
  /** Priority level */
  priority: Priority;
  /** Size of the badge and its contents */
  size?: "sm" | "lg";
}

/**
 * A colored badge that indicates the priority (0-3, inclusive) of a task.
 */
export default function PriorityBadge({
  priority,
  size = "sm",
}: PriorityBadgeProps) {
  let colors = null;
  switch (priority) {
    case 3:
      colors = "bg-red-200 hover:bg-red-200 text-red-900";
      break;
    case 2:
      colors = "bg-orange-200 hover:bg-orange-200 text-orange-900";
      break;
    case 1:
      colors = "bg-yellow-200 hover:bg-yellow-200 text-yellow-900";
      break;
    case 0:
      colors = "bg-blue-200 hover:bg-blue-200 text-blue-900";
      break;
  }
  const sizeClasses = size === "sm" ? "w-24 gap-1" : "w-32 text-base gap-1.5";
  return (
    <Badge
      className={`inline-block ${sizeClasses} ${colors} flex flex-row items-center justify-center`}
    >
      <TriangleAlert size={size === "sm" ? 14 : 16} className="inline" />
      Priority {priority}
    </Badge>
  );
}
