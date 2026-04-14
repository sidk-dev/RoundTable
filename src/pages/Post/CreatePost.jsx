import PostForm from "../../components/Post/PostForm";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const communityId = query.get("communityId");

  const handleSuccess = async (createdPost) => {
    const promises = [
      queryClient.invalidateQueries({ queryKey: ["globalPosts"] }),
      queryClient.invalidateQueries({ queryKey: ["communityFeedPosts"] }),
    ];

    if (communityId) {
      promises.push(
        queryClient.invalidateQueries({
          queryKey: ["communityPosts", communityId],
        }),
      );
    }

    await Promise.all(promises);

    if (createdPost?.id) {
      navigate(`/posts/${createdPost.id}`);
      return;
    }

    navigate("/posts");
  };

  return <PostForm onSuccess={handleSuccess} onCancel={() => navigate(-1)} />;
}
