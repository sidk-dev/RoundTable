import { Link, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button/Button";
import { postService } from "../../roundtable";
import { resolveAuthorImage } from "../../utils/userImage";
import { formatPostDate } from "../../utils/postUtils";

function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = useSelector((state) => state.auth.user?.userId);

  const postQuery = useQuery({
    queryKey: ["post", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const post = await postService.getPost(id);
      if (!post) return null;

      return {
        ...post,
        author: {
          ...post.author,
          profileImage: await resolveAuthorImage(post?.author?.profileImage),
        },
      };
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (postQuery.status === "pending") {
    return (
      <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-surface p-8 text-sm text-t-secondary">
          Loading post...
        </div>
      </div>
    );
  }

  if (postQuery.status === "error") {
    return (
      <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-surface p-8">
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
      <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-surface p-8">
          <p className="text-sm text-t-secondary">Post not found.</p>
          <Button className="mt-4" onClick={() => navigate("/posts")}>
            Back to Posts
          </Button>
        </div>
      </div>
    );
  }

  const authorFirstName = post?.author?.firstName || "Unknown";
  const authorLastName = post?.author?.lastName || "User";
  const authorName = `${authorFirstName} ${authorLastName}`.trim();
  const canEditPost = Boolean(
    currentUserId && currentUserId === post?.author?.id,
  );

  return (
    <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button onClick={() => navigate(-1)}>Back</Button>
          <div className="flex items-center gap-3">
            {canEditPost ? (
              <Button onClick={() => navigate(`/posts/${post.id}/edit`)}>
                Edit Post
              </Button>
            ) : null}
            {post?.community?.id ? (
              <Link
                to={`/communities/${post.community.id}`}
                className="text-sm text-primary hover:underline"
              >
                View Community
              </Link>
            ) : null}
          </div>
        </div>

        <article className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          {post?.community?.name ? (
            <span className="mb-4 inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              {post.community.name}
            </span>
          ) : null}

          <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>

          <div className="mt-6 flex items-center gap-3 border-b border-border pb-6">
            <Avatar
              firstName={authorFirstName}
              lastName={authorLastName}
              profileImage={post?.author?.profileImage}
              size="md"
            />
            <div>
              <p className="text-sm font-medium">{authorName}</p>
              <p className="text-xs text-t-muted">
                {formatPostDate(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="whitespace-pre-wrap text-base leading-7 text-t-primary">
              {post.content}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

export default PostPage;
