export function formatPostDate(dateString) {
  if (!dateString) return "";

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function normalizePost(post) {
  const author = post?.author || {};

  return {
    id: post?.id,
    title: post?.title || "Untitled post",
    description: post?.content || "No content available.",
    community: post?.community?.name || "",
    date: formatPostDate(post?.createdAt),
    author: {
      firstName: author?.firstName || "Unknown",
      lastName: author?.lastName || "User",
      profileImage: author?.profileImage || null,
    },
  };
}
