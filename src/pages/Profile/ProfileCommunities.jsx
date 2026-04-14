import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button/Button";
import { communityService } from "../../roundtable";
import { withCommunityOwnerImages } from "../../utils/communityUtils";

const USER_COMMUNITIES_PAGE_SIZE = 18;

function ProfileCommunitiesPage() {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user?.userId);

  const communitiesQuery = useInfiniteQuery({
    queryKey: ["userCommunities", userId],
    enabled: Boolean(userId),
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const result = await communityService.getUserCommunities({
        userId,
        limit: USER_COMMUNITIES_PAGE_SIZE,
        nextToken: pageParam,
      });

      return {
        communities: await withCommunityOwnerImages(result.communities || []),
        nextToken: result.nextToken,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextToken || undefined,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const communities = useMemo(() => {
    const pages = communitiesQuery.data?.pages || [];
    return pages.flatMap((page) => page?.communities || []);
  }, [communitiesQuery.data]);

  return (
    <div className="min-h-screen bg-bg text-t-primary px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                My Communities
              </h1>
              <p className="text-sm text-t-secondary mt-2">
                Communities you own or joined.
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="bg-surface border border-border hover:border-primary-400 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Back to Profile
            </button>
          </div>
        </section>

        <section className="space-y-5">
          {communitiesQuery.status === "pending" ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              Loading communities...
            </div>
          ) : null}

          {communitiesQuery.status === "error" ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-t-secondary">
                {communitiesQuery.error?.message ||
                  "Failed to load communities."}
              </p>
              <button
                onClick={() => communitiesQuery.refetch()}
                className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : null}

          {communitiesQuery.status === "success" && communities.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
              You have not joined any communities yet.
            </div>
          ) : null}

          {communities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {communities.map((community) => {
                const owner = community.communityOwner || {};
                const ownerName =
                  `${owner.firstName || "Unknown"} ${owner.lastName || "User"}`.trim();

                return (
                  <article
                    key={community.id}
                    className="rounded-2xl border border-border bg-surface p-6 hover:border-primary-400 hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/communities/${community.id}`)}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h2 className="text-lg font-semibold line-clamp-1">
                        {community.name}
                      </h2>
                      <span className="text-xs rounded-full border border-border px-2 py-0.5 text-t-muted">
                        {community.visibility}
                      </span>
                    </div>

                    <p className="text-sm text-t-secondary line-clamp-3 min-h-16">
                      {community.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-t-muted">
                      <span>{community.membershipsCount || 0} members</span>
                      <span>{community.postsCount || 0} posts</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                      <Avatar
                        firstName={owner.firstName || "Unknown"}
                        lastName={owner.lastName || "User"}
                        profileImage={owner.profileImage}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium">{ownerName}</p>
                        <p className="text-xs text-t-muted">Owner</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {communitiesQuery.hasNextPage ? (
            <div className="pt-2">
              <Button
                onClick={() => communitiesQuery.fetchNextPage()}
                disabled={communitiesQuery.isFetchingNextPage}
              >
                {communitiesQuery.isFetchingNextPage
                  ? "Loading..."
                  : "Load More"}
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default ProfileCommunitiesPage;
