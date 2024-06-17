import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  FocusEvent,
  KeyboardEvent,
} from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EditableFieldBaseProps<T> = {
  value: T;
  setValue: (value: T) => void;
  className?: string;
  size?: "sm" | "lg";
};

type EditableFieldStringProps = EditableFieldBaseProps<string>;
type EditableFieldStringOrUndefinedProps = EditableFieldBaseProps<
  string | undefined
> & { defaultText: string };

export type EditableFieldProps =
  | EditableFieldStringProps
  | EditableFieldStringOrUndefinedProps;

export default function EditableField({
  className,
  value,
  setValue,
  size = "lg",
  ...props
}: EditableFieldProps) {
  const [isBeingEdited, setIsBeingEdited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Bring focus into the Input as soon as it appears.
    if (isBeingEdited && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBeingEdited]);
  if (value) {
    props;
  }

  const handleBlurOrEnter = (
    e: FocusEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>,
  ) => {
    // Handle both blur and Enter key press
    if (
      e.type === "blur" ||
      (e.type === "keydown" && (e as KeyboardEvent).key === "Enter")
    ) {
      setIsBeingEdited(false);
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  const inputClass = `px-2 py-0 text-inherit ${size === "lg" ? "text-lg h-10" : "text-sm h-8"}`;
  const staticClass = `flex items-center px-2 py-0 ${size === "lg" ? "text-lg h-10" : "text-sm h-8"}`;
  return (
    <div className={cn("w-full", className)}>
      {isBeingEdited ? (
        <Input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlurOrEnter}
          onKeyDown={handleBlurOrEnter}
          className={inputClass}
        />
      ) : (
        <div className={staticClass} onClick={() => setIsBeingEdited(true)}>
          {value ? (
            <span>{value}</span>
          ) : (
            <span className="italic">
              {(props as EditableFieldStringOrUndefinedProps).defaultText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
