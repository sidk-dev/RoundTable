import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import CommunityForm from "../../components/Community/CommunityForm";
import { communityService } from "../../roundtable";

function EditCommunityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useSelector((state) => state.auth.user?.userId);

  const communityQuery = useQuery({
    queryKey: ["community", id],
    enabled: Boolean(id),
    queryFn: async () => communityService.getCommunity(id),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handleSuccess = async (updatedCommunity) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["community", id] }),
      queryClient.invalidateQueries({ queryKey: ["globalCommunities"] }),
      queryClient.invalidateQueries({ queryKey: ["userCommunities"] }),
    ]);

    navigate(`/communities/${updatedCommunity?.id || id}`);
  };

  if (communityQuery.status === "pending") {
    return (
      <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
          Loading community details...
        </div>
      </div>
    );
  }

  if (communityQuery.status === "error") {
    return (
      <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6">
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

  const community = communityQuery.data;
  if (!community) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6 text-sm text-t-secondary">
          Community not found.
        </div>
      </div>
    );
  }

  const ownerId = community?.communityOwner?.id || community?.communityOwnerId;
  if (ownerId && currentUserId && ownerId !== currentUserId) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-t-secondary">
            Only the community owner can edit this community.
          </p>
          <button
            onClick={() => navigate(`/communities/${id}`)}
            className="mt-4 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            View Community
          </button>
        </div>
      </div>
    );
  }

  return <CommunityForm community={community} onSuccess={handleSuccess} />;
}

export default EditCommunityPage;
