import { useQuery } from "@tanstack/react-query";
import { FolderOpen, ScanSearch, LucideIcon, Link } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <div className="pt-20 px-10 bg-white border-r">
      <ul>
        <li>
          <SidebarLinkAccordion title="Projects" links={projectsLinks} icon={FolderOpen} />
        </li>
        <li>
          <SidebarLinkAccordion title="Views" links={taskViewsLinks} icon={ScanSearch} />
        </li>
        <li>
          <SidebarLinkAccordion title="Other Links" links={otherLinks} icon={Link} />
        </li>
      </ul>
    </div>
  );
}

interface SidebarLinkAccordionProps {
  title: string;
  links: { title: string; href: string }[];
  icon: LucideIcon;
}

function SidebarLinkAccordion({ title, links, icon: Icon }: SidebarLinkAccordionProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" className="border-b-0">
        <AccordionTrigger>
          <div className="flex justify-start items-center">
            <Icon className="inline mr-4" size={16} />
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pl-8 mb-4">
          <ul className="space-y-3">
            {links.map(({ title, href }) => <LinkListItem title={title} href={href} />)}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

interface LinkListItemProps {
  title: string;
  href: string;
}

function LinkListItem({ title, href }: LinkListItemProps) {
  return (
    <li>
      <a href={href}>{title}</a>
    </li>
  )
}