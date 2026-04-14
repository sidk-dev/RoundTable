import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import PostForm from "../../components/Post/PostForm";
import { postService } from "../../roundtable";

function EditPostPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const currentUserId = useSelector((state) => state.auth.user?.userId);

  const postQuery = useQuery({
    queryKey: ["post", id],
    enabled: Boolean(id),
    queryFn: async () => postService.getPost(id),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handleSuccess = async (updatedPost) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["post", id] }),
      queryClient.invalidateQueries({ queryKey: ["globalPosts"] }),
      queryClient.invalidateQueries({ queryKey: ["communityFeedPosts"] }),
    ]);

    navigate(`/posts/${updatedPost?.id || id}`);
  };

  if (postQuery.status === "pending") {
    return (
      <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
          Loading post details...
        </div>
      </div>
    );
  }

  if (postQuery.status === "error") {
    return (
      <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-t-secondary">
            {postQuery.error?.message || "Failed to load post."}
          </p>
          <button
            onClick={() => postQuery.refetch()}
            className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const post = postQuery.data;

  if (!post) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-t-secondary">Post not found.</p>
          <button
            onClick={() => navigate("/posts")}
            className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  if (post?.author?.id && currentUserId && post.author.id !== currentUserId) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-t-secondary">
            You do not have permission to edit this post.
          </p>
          <button
            onClick={() => navigate(`/posts/${id}`)}
            className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            View Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <PostForm
      post={post}
      onSuccess={handleSuccess}
      onCancel={() => navigate(-1)}
    />
  );
}

export default EditPostPage;
