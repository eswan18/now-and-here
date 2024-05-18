import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTitle } from "@/contexts/TitleContext";
import ProjectCardList from "@/components/project/project_card_list";
import { getProjects, projectsAsTrees } from "@/apiServices/project";

export default function Projects() {
  const { setPageTitle, setHeaderTitle } = useTitle();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  useEffect(() => {
    setPageTitle("All projects");
    setHeaderTitle("All projects");
  }, []);

  return (
    <div className="mt-4 lg:mt-8">
      {projectsQuery.isLoading && <p>Loading...</p>}
      {projectsQuery.isError && <p>Error: {projectsQuery.error.message}</p>}
      {projectsQuery.isSuccess && (
        <ProjectCardList projects={projectsAsTrees(projectsQuery.data)} />
      )}
    </div>
  );
}
