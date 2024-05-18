import { forwardRef } from "react";
import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { getProjects } from "@/apiServices/project";
import { getTaskViews } from "@/apiServices/view";
import { useTitle } from "@/contexts/TitleContext";
import { cn } from "@/lib/utils";

export default function Root() {
  const { pageTitle, headerTitle } = useTitle();

  useEffect(() => {
    // This will update the browser tab title.
    document.title = `Now and Here: ${pageTitle}`;
  }, [pageTitle]);

  return (
    <div className="flex flex-col justify-start w-full min-h-screen bg-gray-50">
      <NavBar />
      <div className="w-full h-16 lg:h-28 lg:py-4 bg-orange-800">
        <div className="lg:max-w-[60rem] mx-auto p-4 lg:p-8 text-orange-50 text-xl font-semibold tracking-tight">
          {headerTitle}
        </div>
      </div>
      <div className="w-full">
        <div className="lg:max-w-[60rem] mx-auto px-4 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function NavBar() {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  const taskViewsQuery = useQuery({
    queryKey: ["taskViews"],
    queryFn: () => getTaskViews(),
  });
  return (
    <div className="w-full px-4 h-10 bg-white">
      <div className="flex flex-row justify-between items-center h-full w-full px-4 lg:px-8">
        <h1 className="text-base lg:text-lg font-bold text-orange-800">
          <Link to="/">Now and Here</Link>
        </h1>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
              <NavigationMenuContent className="max-w-40 lg:max-w-60">
                <ul className="grid w-48 gap-3 p-4">
                  <BoldListItem title="All projects" href="/projects" />
                  {projectsQuery.isSuccess &&
                    projectsQuery.data.map((project) => (
                      <RegularListItem
                        key={project.id}
                        title={project.name}
                        href={`/projects/${project.id}`}
                      ></RegularListItem>
                    ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Views</NavigationMenuTrigger>
              <NavigationMenuContent className="max-w-40 lg:max-w-48">
                <ul className="grid w-48 gap-3 p-4">
                  <BoldListItem title="All views" href="/task_views" />
                  {taskViewsQuery.isSuccess &&
                    taskViewsQuery.data.map((view) => (
                      <RegularListItem
                        key={`taskview-${view.name}`}
                        title={view.name}
                        href={`/task_views/${view.name.toLowerCase()}`}
                      ></RegularListItem>
                    ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                href="/docs"
                className={navigationMenuTriggerStyle()}
              >
                API Docs
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

const BoldListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
BoldListItem.displayName = "BoldListItem";

const RegularListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
RegularListItem.displayName = "RegularListItem";
