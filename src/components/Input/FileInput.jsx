import React, { useId } from "react";
import FormField from "./FormField";

/*
Usage Example:-

<Controller
    name="Field"
    control={control}
    rules={{ required: "Field is required" }}
    render={({ field }) => (
        <FileInput
        label="Field"
        accept=".pdf"
        {...field}
        error={errors.Field?.message}
        />
    )}
/>
*/

const FileInput = ({
  label,
  error,
  value,
  onChange,
  disabled = false,
  className = "",
  ...props
}) => {
  const id = useId();

  return (
    <FormField label={label} error={error} labelId={id}>
      <div className="space-y-1">
        <input
          id={id}
          type="file"
          disabled={disabled}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className={`
            block w-full text-sm
            file:mr-4 file:rounded-md file:border-0
            file:px-3 file:py-2
            file:text-sm file:font-medium

            bg-surface text-t-primary
            border border-border rounded-md shadow-sm
            transition-colors duration-200
            focus:outline-none focus:ring-2

            ${
              error
                ? "border-error focus:ring-error"
                : "focus:border-primary focus:ring-primary-300"
            }

            ${
              disabled
                ? "bg-elevated text-t-disabled cursor-not-allowed opacity-70 file:cursor-not-allowed"
                : ""
            }

            file:bg-elevated file:text-t-primary
            file:hover:bg-surface

            ${className}
          `}
          {...props}
        />

        {value && (
          <p className="text-xs text-t-muted truncate">
            Selected: {value.name}
          </p>
        )}
      </div>
    </FormField>
  );
};

export default FileInput;
