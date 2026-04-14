import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import CommunityForm from "../../components/Community/CommunityForm";

function CreateCommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSuccess = async (community) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["globalCommunities"] }),
      queryClient.invalidateQueries({ queryKey: ["userCommunities"] }),
      queryClient.invalidateQueries({ queryKey: ["joinedCommunityIds"] }),
    ]);

    if (community?.id) {
      navigate(`/communities/${community.id}`);
      return;
    }

    navigate("/communities");
  };

  return <CommunityForm onSuccess={handleSuccess} />;
}

export default CreateCommunityPage;
