import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation } from "react-router";

import FormMessage from "../../components/Form/FormMessage";
import Input from "../../components/Input/Input";
import TextareaInput from "../../components/Input/TextareaInput";
import SelectInput from "../../components/Input/SelectInput";
import Button from "../../components/Button/Button";
import { postService } from "../../roundtable";
import { useSelector } from "react-redux";

export default function PostForm({ post, onSuccess }) {
  // Read query params
  const user = useSelector((state) => state.auth.user);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const communityName = query.get("communityName");
  const communityId = query.get("communityId");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      visibility: post?.visibility || "PUBLIC",
    },
  });

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
        visibility: post.visibility,
      });
    }
  }, [post, reset]);

  const onSubmit = async (data) => {
    clearErrors("root");

    try {
      // Attach communityId if present in query params
      if (communityId) {
        data.communityId = communityId;
      }

      const finalData = {
        authorId: user.userId,
        ...data,
      };

      let result;
      if (post && post.id) {
        // Edit mode
        result = await postService.updatePost(post.id, finalData);
      } else {
        // Create mode
        result = await postService.createPost(finalData);
      }

      //   if (onSuccess) onSuccess(result);
      reset();
    } catch (err) {
      console.error("Error saving post:", err);
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
            {post ? "Edit Post" : "Create Post"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-t-muted">
            {post
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
                    {...register("title", { required: "Title is required" })}
                    error={errors.title?.message}
                  />

                  <TextareaInput
                    label="Content"
                    placeholder="Write your post here..."
                    {...register("content", {
                      required: "Content is required",
                    })}
                    error={errors.content?.message}
                  />

                  {/* Show Visibility only if community query params exist */}
                  {communityId && communityName && (
                    <SelectInput
                      label="Visibility"
                      {...register("visibility")}
                      error={errors.visibility?.message}
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="COMMUNITY">Community</option>
                    </SelectInput>
                  )}
                </div>
              </section>

              {/* Actions */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? post
                      ? "Updating post…"
                      : "Creating post…"
                    : post
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
