import { useEffect, useMemo, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button/Button";
import PostCard from "../../components/Post/PostCard";
import { communityService, postService } from "../../roundtable";
import { withCommunityOwnerImage } from "../../utils/communityUtils";
import { resolveAuthorImage } from "../../utils/userImage";
import { normalizePost } from "../../utils/postUtils";

const COMMUNITY_POSTS_PAGE_SIZE = 20;

function CommunityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useSelector((state) => state.auth.user?.userId);
  const sentinelRef = useRef(null);
  const [joinRole, setJoinRole] = useState("VIEWER");
  const [membershipActionError, setMembershipActionError] = useState("");
  const [membershipActionLoading, setMembershipActionLoading] = useState(false);

  const communityQuery = useQuery({
    queryKey: ["community", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const community = await communityService.getCommunity(id);
      return withCommunityOwnerImage(community);
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const membershipQuery = useQuery({
    queryKey: ["communityMembership", id, userId],
    enabled: Boolean(id && userId),
    queryFn: async () => communityService.getUserMembership(id, userId),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const postsQuery = useInfiniteQuery({
    queryKey: ["communityPosts", id],
    enabled: Boolean(id),
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const res = await postService.getCommunityPosts({
        communityId: id,
        limit: COMMUNITY_POSTS_PAGE_SIZE,
        nextToken: pageParam,
      });

      const hydratedPosts = await Promise.all(
        (res?.posts || []).map(async (post) => ({
          ...post,
          author: {
            ...post.author,
            profileImage: await resolveAuthorImage(post?.author?.profileImage),
          },
        })),
      );

      return {
        ...res,
        posts: hydratedPosts,
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
    const pages = postsQuery.data?.pages || [];
    return pages.flatMap((page) => (page?.posts || []).map(normalizePost));
  }, [postsQuery.data]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !postsQuery.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          postsQuery.hasNextPage &&
          !postsQuery.isFetchingNextPage &&
          !postsQuery.isFetching
        ) {
          postsQuery.fetchNextPage();
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
    postsQuery.fetchNextPage,
    postsQuery.hasNextPage,
    postsQuery.isFetching,
    postsQuery.isFetchingNextPage,
  ]);

  const community = communityQuery.data;
  const ownerId = community?.communityOwner?.id || community?.communityOwnerId;
  const isOwner = Boolean(ownerId && userId && ownerId === userId);
  const membership = membershipQuery.data;
  const isMember = isOwner || Boolean(membership);
  const memberRole = isOwner ? "ADMIN" : membership?.role || null;
  const canCreatePost = memberRole === "ADMIN" || memberRole === "WRITER";
  const canJoin = community?.visibility === "PUBLIC" && !isMember;

  const handleJoin = async () => {
    if (!id || !userId) return;

    try {
      setMembershipActionLoading(true);
      setMembershipActionError("");
      await communityService.joinCommunity({
        communityId: id,
        userId,
        role: joinRole,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["communityMembership", id, userId],
        }),
        queryClient.invalidateQueries({ queryKey: ["community", id] }),
        queryClient.invalidateQueries({
          queryKey: ["userCommunities", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["joinedCommunityIds", userId],
        }),
        queryClient.invalidateQueries({ queryKey: ["globalCommunities"] }),
      ]);
    } catch (error) {
      setMembershipActionError(error?.message || "Failed to join community.");
    } finally {
      setMembershipActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!id || !userId || isOwner) return;

    try {
      setMembershipActionLoading(true);
      setMembershipActionError("");
      await communityService.leaveCommunity({
        communityId: id,
        userId,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["communityMembership", id, userId],
        }),
        queryClient.invalidateQueries({ queryKey: ["community", id] }),
        queryClient.invalidateQueries({
          queryKey: ["userCommunities", userId],
        }),
        queryClient.invalidateQueries({ queryKey: ["globalCommunities"] }),
        queryClient.invalidateQueries({
          queryKey: ["joinedCommunityIds", userId],
        }),
        queryClient.invalidateQueries({ queryKey: ["communityFeedPosts"] }),
      ]);
    } catch (error) {
      setMembershipActionError(error?.message || "Failed to leave community.");
    } finally {
      setMembershipActionLoading(false);
    }
  };

  if (communityQuery.status === "pending") {
    return (
      <div className="min-h-screen bg-bg px-6 py-12">
        <div className="max-w-6xl mx-auto rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
          Loading community...
        </div>
      </div>
    );
  }

  if (communityQuery.status === "error") {
    return (
      <div className="min-h-screen bg-bg px-6 py-12">
        <div className="max-w-6xl mx-auto rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-t-secondary">
            {communityQuery.error?.message || "Failed to load community."}
          </p>
          <button
            onClick={() => communityQuery.refetch()}
            className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-bg px-6 py-12">
        <div className="max-w-6xl mx-auto rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
          Community not found.
        </div>
      </div>
    );
  }

  const owner = community.communityOwner || {};
  const ownerName =
    `${owner.firstName || "Unknown"} ${owner.lastName || "User"}`.trim();

  return (
    <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8 justify-between">
            <div className="flex-1">
              <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary-100 text-primary-700 mb-4">
                {community.visibility}
              </span>
              <h1 className="text-3xl font-bold mb-3">{community.name}</h1>
              <p className="text-sm text-t-secondary">
                {community.description}
              </p>

              <div className="mt-4 flex items-center gap-3 text-xs text-t-muted">
                <span>{community.membershipsCount || 0} members</span>
                <span>{community.postsCount || 0} posts</span>
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  firstName={owner.firstName || "Unknown"}
                  lastName={owner.lastName || "User"}
                  profileImage={owner.profileImage}
                  size="md"
                />
                <div>
                  <p className="text-sm font-medium">{ownerName}</p>
                  <p className="text-xs text-t-muted">Owner</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => navigate("/communities")}
                  className="bg-surface border border-border hover:border-primary-400 px-4 py-2 rounded-xl transition"
                >
                  Back to Communities
                </button>
                {canCreatePost ? (
                  <Button
                    onClick={() =>
                      navigate(
                        `/posts/create/?communityName=${encodeURIComponent(community.name)}&communityId=${community.id}`,
                      )
                    }
                  >
                    Create Post
                  </Button>
                ) : null}

                {isOwner ? (
                  <Button
                    onClick={() =>
                      navigate(`/communities/${community.id}/edit`)
                    }
                  >
                    Edit Community
                  </Button>
                ) : null}

                {canJoin ? (
                  <>
                    <select
                      value={joinRole}
                      onChange={(event) => setJoinRole(event.target.value)}
                      className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-t-primary"
                      disabled={membershipActionLoading}
                    >
                      <option value="VIEWER">Join as Viewer</option>
                      <option value="WRITER">Join as Writer</option>
                    </select>
                    <Button
                      onClick={handleJoin}
                      disabled={membershipActionLoading}
                    >
                      {membershipActionLoading
                        ? "Joining..."
                        : "Join Community"}
                    </Button>
                  </>
                ) : null}

                {!isOwner && isMember ? (
                  <Button
                    onClick={handleLeave}
                    disabled={membershipActionLoading}
                  >
                    {membershipActionLoading ? "Leaving..." : "Leave Community"}
                  </Button>
                ) : null}
              </div>

              {membershipActionError ? (
                <p className="text-sm text-error">{membershipActionError}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Community Posts</h2>
            <span className="text-xs rounded-full border border-border px-3 py-1 text-t-muted">
              {community.postsCount || 0} total
            </span>
          </div>

          {postsQuery.status === "pending" ? (
            <div className="text-sm text-t-secondary">Loading posts...</div>
          ) : null}

          {postsQuery.status === "error" ? (
            <div>
              <p className="text-sm text-t-secondary">
                {postsQuery.error?.message || "Failed to load posts."}
              </p>
              <button
                onClick={() => postsQuery.refetch()}
                className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : null}

          {postsQuery.status === "success" && posts.length === 0 ? (
            <div className="text-sm text-t-secondary">
              No posts in this community yet.
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

          {postsQuery.isFetchingNextPage ? (
            <p className="text-sm text-t-secondary mt-6">
              Loading more posts...
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default CommunityPage;
