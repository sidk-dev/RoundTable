import React, { useId } from "react";
import FormField from "./FormField";

const TextareaInput = ({
  label,
  error,
  autoComplete = "off",
  className = "",
  disabled = false,
  rows = 4,
  resize = "vertical", // "none" | "vertical" | "horizontal" | "both"
  ...props
}) => {
  const id = useId();

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  };

  return (
    <FormField label={label} error={error} labelId={id}>
      <div className="relative">
        <textarea
          id={id}
          rows={rows}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full rounded-md border px-3 py-2 text-sm
            bg-surface text-t-primary
            border-border shadow-sm
            transition-colors duration-200
            focus:outline-none focus:ring-2

            ${
              error
                ? "border-error focus:ring-error"
                : "focus:border-primary focus:ring-primary-300"
            }

            ${
              disabled
                ? "bg-elevated text-t-disabled cursor-not-allowed opacity-70"
                : ""
            }

            ${resizeClasses[resize] || "resize-y"}
            placeholder:text-t-muted
            ${className}
          `}
          {...props}
        />
      </div>
    </FormField>
  );
};

export default TextareaInput;
