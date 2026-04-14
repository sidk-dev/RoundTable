import { resolveAuthorImage } from "./userImage";

export async function withCommunityOwnerImage(community) {
  if (!community) return null;

  const owner = community.communityOwner;
  if (!owner) return community;

  return {
    ...community,
    communityOwner: {
      ...owner,
      profileImage: await resolveAuthorImage(owner.profileImage),
    },
  };
}

export async function withCommunityOwnerImages(communities = []) {
  return Promise.all((communities || []).map(withCommunityOwnerImage));
}
