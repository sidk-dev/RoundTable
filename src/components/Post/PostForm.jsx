import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";

import FormMessage from "../../components/Form/FormMessage";
import Input from "../../components/Input/Input";
import TextareaInput from "../../components/Input/TextareaInput";
import SelectInput from "../../components/Input/SelectInput";
import Button from "../../components/Button/Button";
import { postService } from "../../roundtable";
import { useSelector } from "react-redux";

export default function PostForm({ post = null, onSuccess, onCancel }) {
  const user = useSelector((state) => state.auth.user);
  const isEditMode = Boolean(post?.id);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const communityName = query.get("communityName");
  const communityId = query.get("communityId");
  const effectiveCommunityId = post?.community?.id || communityId || null;

  const defaultValues = useMemo(
    () => ({
      title: post?.title || "",
      content: post?.content || "",
      visibility: post?.visibility || "PUBLIC",
    }),
    [effectiveCommunityId, post],
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

  const isCommunityPost = Boolean(effectiveCommunityId);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    clearErrors("root");

    try {
      if (!user?.userId) {
        throw new Error("Please login again and retry.");
      }

      const finalData = {
        title: data.title,
        content: data.content,
        visibility: data.visibility,
      };

      if (!isEditMode) {
        finalData.authorId = user.userId;
      }

      const resolvedCommunityId = effectiveCommunityId || null;
      if (resolvedCommunityId) {
        finalData.communityId = resolvedCommunityId;
      }

      let result;
      if (isEditMode) {
        result = await postService.updatePost(post.id, finalData);
      } else {
        result = await postService.createPost(finalData);
      }

      if (onSuccess) {
        await onSuccess(result);
      } else if (!isEditMode) {
        reset(defaultValues);
      }
    } catch (err) {
      setError("root", {
        type: "server",
        message: err.message || "Failed to save post",
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-t-primary">
            {isEditMode ? "Edit Post" : "Create Post"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-t-muted">
            {isEditMode
              ? "Update the content of your post."
              : communityName
                ? `Create a new post in ${communityName}`
                : "Create a new post."}
          </p>
        </header>

        {/* Form surface */}
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
              {/* Post details */}
              <section>
                <h2 className="mb-4 text-lg font-medium text-t-primary">
                  Post Details
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Title"
                    placeholder="Post title"
                    {...register("title", {
                      required: "Title is required",
                      minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters.",
                      },
                      maxLength: {
                        value: 120,
                        message: "Title must be at most 120 characters.",
                      },
                    })}
                    error={errors.title?.message}
                  />

                  <TextareaInput
                    label="Content"
                    placeholder="Write your post here..."
                    {...register("content", {
                      required: "Content is required",
                      minLength: {
                        value: 10,
                        message: "Content must be at least 10 characters.",
                      },
                      maxLength: {
                        value: 5000,
                        message: "Content must be at most 5000 characters.",
                      },
                    })}
                    error={errors.content?.message}
                  />

                  {isCommunityPost ? (
                    <SelectInput
                      label="Visibility"
                      {...register("visibility", {
                        required: "Visibility is required.",
                      })}
                      error={errors.visibility?.message}
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="COMMUNITY_ONLY">Community Only</option>
                    </SelectInput>
                  ) : null}
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
                {onCancel ? (
                  <Button
                    type="button"
                    buttonColor="bg-surface"
                    className="border border-border"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                ) : null}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditMode
                      ? "Updating post…"
                      : "Creating post…"
                    : isEditMode
                      ? "Update Post"
                      : "Create Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
