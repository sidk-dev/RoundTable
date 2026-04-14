import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import { authService, postService } from "../../roundtable";
import Button from "../../components/Button/Button";
import { Link, useNavigate } from "react-router";
import Avatar from "../../components/Avatar";
import PostCard from "../../components/Post/PostCard";
import { resolveAuthorImage } from "../../utils/userImage";
import { normalizePost } from "../../utils/postUtils";

function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const firstName = user?.firstName || "Unknown";
  const lastName = user?.lastName || "User";
  const fullName = `${firstName} ${lastName}`.trim();
  const bio = user?.bio?.trim()
    ? user.bio
    : "No bio added yet. Update your profile to add one.";

  const stats = [
    {
      label: "Communities",
      value: user?.membershipsCount ?? user?.communitiesCount ?? 0,
    },
    { label: "Posts", value: user?.postsCount ?? 0 },
  ];

  const userPostsQuery = useInfiniteQuery({
    queryKey: ["userPosts", user?.userId],
    enabled: Boolean(user?.userId),
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const result = await postService.getUserPosts({
        userId: user?.userId,
        limit: 10,
        nextToken: pageParam,
      });

      const postsWithImages = await Promise.all(
        (result.posts || []).map(async (post) => ({
          ...post,
          author: {
            ...post.author,
            profileImage: await resolveAuthorImage(post?.author?.profileImage),
          },
        })),
      );

      return {
        ...result,
        posts: postsWithImages,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextToken || undefined,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const posts = useMemo(() => {
    const pages = userPostsQuery.data?.pages || [];
    return pages.flatMap((page) => (page?.posts || []).map(normalizePost));
  }, [userPostsQuery.data]);

  return (
    <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Profile Header */}
        <section className="relative bg-surface border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* ProfileImage */}
            <div className="relative">
              <Avatar
                firstName={firstName}
                lastName={lastName}
                profileImage={user?.profileImage}
                size="xlg"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {fullName}
                  </h1>
                  <p className="text-sm text-t-secondary mt-2">
                    Manage your profile, posts, and communities.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-center lg:justify-end gap-3">
                  <Link to="/profile/edit">
                    <Button>Edit Profile</Button>
                  </Link>
                  <Link to="/change-password">
                    <Button>Change Password</Button>
                  </Link>
                  <Button
                    onClick={() => {
                      authService.userLogout();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>

              <p className="text-sm text-t-muted max-w-2xl text-center lg:text-left">
                {bio}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-6 text-center hover:shadow-md transition"
            >
              <p className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-t-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <section>
          <Link to="/profile/communities" className="inline-block">
            <Button>View All Communities</Button>
          </Link>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">My Posts</h2>
          </div>

          {userPostsQuery.status === "pending" ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              Loading your posts...
            </div>
          ) : null}

          {userPostsQuery.status === "error" ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-t-secondary">
                {userPostsQuery.error?.message || "Failed to load your posts."}
              </p>
              <button
                onClick={() => userPostsQuery.refetch()}
                className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : null}

          {userPostsQuery.status === "success" && posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              You have not created any posts yet.
            </div>
          ) : null}

          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  description={post.description}
                  community={post.community}
                  date={post.date}
                  author={post.author}
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              ))}
            </div>
          ) : null}

          {userPostsQuery.hasNextPage ? (
            <div className="pt-2">
              <Button
                onClick={() => userPostsQuery.fetchNextPage()}
                disabled={userPostsQuery.isFetchingNextPage}
              >
                {userPostsQuery.isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
