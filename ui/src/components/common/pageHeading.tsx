import { cn } from "@/lib/utils";

export interface PageHeadingProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export default function PageHeading({
  title,
  children,
  className,
}: PageHeadingProps) {
  const defaultClass =
    "flex flex-row justify-between items-start my-8 lg:my-16";
  const finalClass = cn(defaultClass, className);
  return (
    <div className={finalClass}>
      <h1 className="text-2xl font-semibold text-gray-900 tracking-wide">
        {title}
      </h1>
      {children}
    </div>
  );
}
