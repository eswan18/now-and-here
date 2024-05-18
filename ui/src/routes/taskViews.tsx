import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTitle } from "@/contexts/TitleContext";
import { getTaskViews } from "@/apiServices/view";
import TaskViewCardList from "@/components/view";

export default function TaskViews() {
  const { setPageTitle, setHeaderTitle } = useTitle();
  const viewsQuery = useQuery({
    queryKey: ["taskViews"],
    queryFn: () => getTaskViews(),
  });
  useEffect(() => {
    setPageTitle("Views");
    setHeaderTitle("All views");
  }, [setPageTitle, setHeaderTitle]);

  return (
    <div className="mt-4 lg:mt-8">
      {viewsQuery.isLoading && <p>Loading...</p>}
      {viewsQuery.isError && <p>Error: {viewsQuery.error.message}</p>}
      {viewsQuery.isSuccess && <TaskViewCardList views={viewsQuery.data} />}
    </div>
  );
}
