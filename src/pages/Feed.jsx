import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import PostCard from "../components/Post/PostCard";
import { communityService, postService } from "../roundtable";
import { normalizePost } from "../utils/postUtils";
import { COMMUNITY_FEED_POSTS_PAGE_SIZE } from "../constants/PostConstants";
import { resolveAuthorImage } from "../utils/userImage";

function FeedPage() {
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const userId = useSelector((state) => state.auth.user?.userId);

  const joinedCommunitiesQuery = useQuery({
    queryKey: ["joinedCommunityIds", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      return communityService.getJoinedCommunityIds(userId);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const communityIds = useMemo(() => {
    const ids = joinedCommunitiesQuery.data || [];
    return Array.from(new Set(ids.filter(Boolean))).sort();
  }, [joinedCommunitiesQuery.data]);

  const communityIdsKey = useMemo(() => communityIds.join(","), [communityIds]);

  const feedPostsQuery = useInfiniteQuery({
    queryKey: ["communityFeedPosts", communityIdsKey],
    enabled: communityIds.length > 0,
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const result = await postService.getCommunitiesPosts({
        communityIds,
        limit: COMMUNITY_FEED_POSTS_PAGE_SIZE,
        nextToken: pageParam,
      });

      const postsWithAuthorImages = await Promise.all(
        (result.posts || []).map(async (post) => ({
          ...post,
          author: {
            ...post.author,
            profileImage: await resolveAuthorImage(post?.author?.profileImage),
          },
        })),
      );

      return {
        posts: postsWithAuthorImages,
        nextToken: result.nextToken,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextToken || undefined,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const posts = useMemo(() => {
    const pages = feedPostsQuery.data?.pages || [];
    return pages.flatMap((page) => (page?.posts || []).map(normalizePost));
  }, [feedPostsQuery.data]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !feedPostsQuery.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          feedPostsQuery.hasNextPage &&
          !feedPostsQuery.isFetchingNextPage &&
          !feedPostsQuery.isFetching
        ) {
          feedPostsQuery.fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "250px 0px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    feedPostsQuery.fetchNextPage,
    feedPostsQuery.hasNextPage,
    feedPostsQuery.isFetching,
    feedPostsQuery.isFetchingNextPage,
  ]);

  return (
    <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Feed</h1>
              <p className="mt-2 text-sm text-t-secondary max-w-2xl">
                Posts from communities you joined.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate("/communities")}
                className="bg-surface border border-border hover:border-primary-400 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Explore Communities
              </button>
              <button
                onClick={() => navigate("/posts/create")}
                className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition hover:shadow-md"
              >
                Create Post
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-border bg-surface p-8">
          {joinedCommunitiesQuery.status === "pending" ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              Loading your communities...
            </div>
          ) : null}

          {joinedCommunitiesQuery.status === "error" ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-t-secondary">
                {joinedCommunitiesQuery.error?.message ||
                  "Failed to load your communities."}
              </p>
              <button
                onClick={() => joinedCommunitiesQuery.refetch()}
                className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : null}

          {joinedCommunitiesQuery.status === "success" &&
          communityIds.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              You have not joined any communities yet.
            </div>
          ) : null}

          {feedPostsQuery.status === "pending" && communityIds.length > 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              Loading your feed...
            </div>
          ) : null}

          {feedPostsQuery.status === "error" ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-t-secondary">
                {feedPostsQuery.error?.message || "Failed to load feed posts."}
              </p>
              <button
                onClick={() => feedPostsQuery.refetch()}
                className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : null}

          {feedPostsQuery.status === "success" && posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              No posts found in your communities yet.
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

          <div ref={sentinelRef} className="h-1" />

          {feedPostsQuery.isFetchingNextPage ? (
            <p className="text-sm text-t-secondary mt-6">
              Loading more posts...
            </p>
          ) : null}

          {!feedPostsQuery.hasNextPage && posts.length > 0 ? (
            <p className="text-sm text-t-muted mt-6">
              You have reached the end.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default FeedPage;
