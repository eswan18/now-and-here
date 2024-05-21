import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTitle } from "@/contexts/TitleContext";
import ProjectCardList from "@/components/project/project_card_list";
import { getProjects, projectsAsTrees } from "@/apiServices/project";
import PageHeading from "@/components/common/pageHeading";

export default function Projects() {
  const { setPageTitle } = useTitle();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  useEffect(() => {
    setPageTitle("All projects");
  }, [setPageTitle]);

  return (
    <>
      <PageHeading title="All Projects" />
      {projectsQuery.isLoading && <p>Loading...</p>}
      {projectsQuery.isError && <p>Error: {projectsQuery.error.message}</p>}
      {projectsQuery.isSuccess && (
        <ProjectCardList projects={projectsAsTrees(projectsQuery.data)} />
      )}
    </>
  );
}
