import { Badge } from "@/components/ui/badge";

export default function PriorityBadge({ priority }: {priority: number }) {
  let colors = null;
  switch (priority) {
    case 3:
      colors = "bg-red-200 hover:bg-red-200 text-red-900";
      break
    case 2:
      colors = "bg-orange-200 hover:bg-orange-200 text-orange-900";
      break
    case 1:
      colors = "bg-yellow-200 hover:bg-yellow-200 text-yellow-900";
      break
    case 0:
      colors = "bg-blue-200 hover:bg-blue-200 text-blue-900";
      break
  }
  return (
    <Badge className={`inline-block w-20 ${colors}`}>
        Priority { priority }
    </Badge>
  )
}