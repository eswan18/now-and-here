import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTitle } from "@/contexts/TitleContext";
import { getTaskViews } from "@/apiServices/view";
import TaskViewCardList from "@/components/view";
import PageHeading from "@/components/common/pageHeading";

export default function TaskViews() {
  const { setPageTitle } = useTitle();
  const viewsQuery = useQuery({
    queryKey: ["taskViews"],
    queryFn: () => getTaskViews(),
  });
  useEffect(() => {
    setPageTitle("Views");
  }, [setPageTitle]);

  return (
    <>
      <PageHeading title="All Views" />
      {viewsQuery.isLoading && <p>Loading...</p>}
      {viewsQuery.isError && <p>Error: {viewsQuery.error.message}</p>}
      {viewsQuery.isSuccess && <TaskViewCardList views={viewsQuery.data} />}
    </>
  );
}
