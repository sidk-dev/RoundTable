import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import PostCard from "../../components/Post/PostCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "../../roundtable";
import { normalizePost } from "../../utils/postUtils";
import { GLOBAL_POSTS_PAGE_SIZE } from "../../constants/PostConstants";
import { resolveAuthorImage } from "../../utils/userImage";

export default function PostsPage() {
  const navigate = useNavigate();
  const sentinelRef = useRef(null);

  const fetchGlobalPosts = async ({ pageParam }) => {
    const res = await postService.getGlobalPosts({
      limit: GLOBAL_POSTS_PAGE_SIZE,
      nextToken: pageParam,
    });

    const posts = res?.posts || [];

    const updatedPosts = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        author: {
          ...post.author,
          profileImage: await resolveAuthorImage(post?.author?.profileImage),
        },
      })),
    );

    return {
      ...res,
      posts: updatedPosts,
    };
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["globalPosts"],
    queryFn: fetchGlobalPosts,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || undefined,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const posts = useMemo(() => {
    if (!data?.pages?.length) return [];

    return data.pages.flatMap((page) => (page?.posts || []).map(normalizePost));
  }, [data]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (
          firstEntry?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetching
        ) {
          fetchNextPage();
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
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

  return (
    <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
              <p className="text-sm text-t-secondary mt-2">
                Community discussions and shared knowledge.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate("/feed")}
                className="bg-surface border border-border hover:border-primary-400 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Back to Feed
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

        <section className="space-y-5">
          {status === "pending" && posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              Loading posts...
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-t-secondary">
                {error?.message || "Failed to load posts."}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : null}

          {status === "success" && posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              No global posts found.
            </div>
          ) : null}

          {/* Grid */}
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 mt-6">
            {posts.map((post) => {
              return (
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
              );
            })}
          </div>

          <div ref={sentinelRef} className="h-1" />

          {isFetchingNextPage ? (
            <p className="text-sm text-t-secondary mt-6">
              Loading more posts...
            </p>
          ) : null}

          {!hasNextPage && posts.length > 0 ? (
            <p className="text-sm text-t-muted mt-6">
              You have reached the end.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
