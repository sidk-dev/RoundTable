import React, { useEffect, useId, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import FormField from "./FormField";

const FileInput = ({
  label,
  error,
  value, // File | string | null
  onChange,
  disabled = false,
  className = "",
  accept = "image/*",
  ...props
}) => {
  const id = useId();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  // Handle preview generation
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    // If value is an existing image URL (edit mode)
    if (typeof value === "string") {
      setPreview(value);
      return;
    }

    // If value is a File
    if (value && value.type?.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreview(null);
  }, [value]);

  const handleRemove = () => {
    if (disabled) return;

    onChange(null);

    // reset input manually so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <FormField label={label} error={error} labelId={id}>
      <div className="space-y-3">
        <input
          ref={inputRef}
          id={id}
          type="file"
          disabled={disabled}
          accept={accept}
          onChange={handleFileChange}
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

        {/* Preview Section */}
        {value && (
          <div className="relative inline-block">
            {preview ? (
              <div className="relative w-32 h-32 rounded-md overflow-hidden border border-border">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {!disabled && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-t-muted border border-border rounded-md px-3 py-2">
                <span className="truncate max-w-[200px]">
                  {value?.name || "Selected file"}
                </span>

                {!disabled && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-error hover:text-error/80 transition"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
};

export default FileInput;
