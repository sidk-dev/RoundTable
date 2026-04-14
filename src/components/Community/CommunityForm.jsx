import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import FormMessage from "../Form/FormMessage";
import Input from "../Input/Input";
import TextareaInput from "../Input/TextareaInput";
import SelectInput from "../Input/SelectInput";
import Button from "../Button/Button";
import { communityService } from "../../roundtable";
import {
  COMMUNITY_DESCRIPTION_RULES,
  COMMUNITY_NAME_RULES,
} from "../../constants/HookFormValidatonRules";

export default function CommunityForm({ community = null, onSuccess }) {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user?.userId);
  const isEditMode = Boolean(community?.id);

  const defaultValues = useMemo(
    () => ({
      name: community?.name || "",
      description: community?.description || "",
      visibility: community?.visibility || "PUBLIC",
    }),
    [community],
  );

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    clearErrors("root");

    try {
      let result;

      if (isEditMode) {
        result = await communityService.updateCommunity(community.id, {
          description: data.description,
          visibility: data.visibility,
        });
      } else {
        if (!userId) {
          throw new Error("Please login again and retry.");
        }

        result = await communityService.createCommunity({
          ...data,
          communityOwnerId: userId,
        });
      }

      if (onSuccess) {
        await onSuccess(result);
      } else if (result?.id) {
        navigate(`/communities/${result.id}`);
      } else {
        navigate("/communities");
      }
    } catch (err) {
      setError("root", {
        type: "server",
        message: err?.message || "Failed to save community",
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-t-primary">
            {isEditMode ? "Edit Community" : "Create Community"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-t-muted">
            {isEditMode
              ? "Update your community details."
              : "Create a new community and start building focused discussions."}
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl bg-surface shadow-lg">
          <div className="h-1 bg-primary" />

          <div className="p-6 sm:p-8">
            <FormMessage
              type="error"
              message={errors.root?.message}
              className="mb-6"
            />

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-8"
            >
              <section>
                <h2 className="mb-4 text-lg font-medium text-t-primary">
                  Community Details
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Community Name"
                    placeholder="e.g., Product Builders Guild"
                    disabled={isEditMode}
                    {...register("name", COMMUNITY_NAME_RULES)}
                    error={errors.name?.message}
                  />

                  <TextareaInput
                    label="Description"
                    placeholder="Describe your community purpose..."
                    {...register("description", COMMUNITY_DESCRIPTION_RULES)}
                    error={errors.description?.message}
                  />

                  <SelectInput
                    label="Visibility"
                    {...register("visibility", {
                      required: "Visibility is required",
                    })}
                    error={errors.visibility?.message}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </SelectInput>
                </div>
              </section>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  buttonColor="bg-surface"
                  className="border border-border"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditMode
                      ? "Updating community..."
                      : "Creating community..."
                    : isEditMode
                      ? "Update Community"
                      : "Create Community"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
