import { Badge } from "@/components/ui/badge";
import { TriangleAlert } from "lucide-react";

export default function PriorityBadge({ priority }: { priority: number }) {
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
  return (
    <Badge
      className={`inline-block w-24 ${colors} flex flex-row items-center justify-center gap-1`}
    >
      <TriangleAlert size={14} className="inline" />
      Priority {priority}
    </Badge>
  );
}

export function BigPriorityBadge({ priority }: { priority: number }) {
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
  return (
    <Badge
      className={`inline-block w-32 ${colors} text-base flex flex-row items-center justify-center gap-1.5`}
    >
      <TriangleAlert size={16} />
      Priority {priority}
    </Badge>
  );
}
