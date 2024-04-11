export default function PriorityBadge({ priority }: {priority: number }) {
  let colors = null;
  switch (priority) {
    case 0:
      colors = "bg-red-200 text-red-900";
      break
    case 1:
      colors = "bg-orange-200 text-orange-900";
      break
    case 2:
      colors = "bg-yellow-200 text-yellow-900";
      break
    case 3:
      colors = "bg-blue-200 text-blue-900";
      break
  }
  return (
    <div className={`inline-block w-20 ${colors} tracking-wide rounded-full px-2 py-1 text-xs flex flex-row items-center justify-center`}>
        Priority { priority }
    </div>
  )
}