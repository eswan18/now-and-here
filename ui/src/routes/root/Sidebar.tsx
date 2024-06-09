import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/apiServices/project";
import { getTaskViews } from "@/apiServices/view";

export default function Sidebar() {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  const projectsLinks = projectsQuery.isSuccess ? projectsQuery.data.map((project) => ({
    title: project.name,
    href: `/projects/${project.id}`,
  })) : [];

  const taskViewsQuery = useQuery({
    queryKey: ["taskViews"],
    queryFn: () => getTaskViews(),
  });
  const taskViewsLinks = taskViewsQuery.isSuccess ? taskViewsQuery.data.map((view) => ({
    title: view.name,
    href: `/task_views/${view.name.toLowerCase()}`,
  })) : [];

  const otherLinks = [
    { title: "API Docs", href: "/docs" },
  ]

  return (
    <div className="pt-20 px-16 bg-white border-r">
      <ul className="space-y-12">
        <li>
          <SidebarLinkList title="Projects" titleLink="/projects" links={projectsLinks} />
        </li>
        <li>
          <SidebarLinkList title="Views" titleLink="/task_views" links={taskViewsLinks} />
        </li>
        <li>
          <SidebarLinkList title="Other Links" links={otherLinks} />
        </li>
      </ul>
    </div>
  );
}

interface SidebarLinkListProps {
  title: string;
  titleLink?: string;
  links: { title: string; href: string }[];
}

function SidebarLinkList({ title, titleLink, links }: SidebarLinkListProps) {
  return (
    <>
      <h4 className="font-bold mb-2 text-gray-500">
        {titleLink
          ? <a href={titleLink}>{title}</a>
          : title
        }
      </h4>
      <ul className="space-y-1">
        {links.map(({ title, href }) => (
          <li key={href}>
            <a href={href}>{title}</a>
          </li>
        ))}
      </ul>
    </>
  )
}