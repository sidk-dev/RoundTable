import { generateClient } from "aws-amplify/api";
// import { Amplify } from "aws-amplify";
// import outputs from "../../amplify_outputs.json";

/*
  This is implemented to: Amplify has not been configured. Please call Amplify.configure() before using this service.
*/
// Amplify.configure(outputs);

class CommunityService {
  constructor() {
    /**
     * @type {import('aws-amplify/data').Client<import('../../amplify/data/resource').Schema>}
     */
    this.client = generateClient();
  }

  _toNumber(value) {
    return typeof value === "number" ? value : 0;
  }

  _clampToZero(value) {
    return Math.max(0, this._toNumber(value));
  }

  _toServiceError(error, fallbackMessage) {
    if (Array.isArray(error) && error.length > 0) {
      const message = error[0]?.message || fallbackMessage;
      return new Error(message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(fallbackMessage);
  }

  async _adjustUserCounters(
    userId,
    { communitiesDelta = 0, membershipsDelta = 0 } = {},
  ) {
    if (!userId || (!communitiesDelta && !membershipsDelta)) {
      return;
    }

    const { data: user, errors } = await this.client.models.User.get({
      id: userId,
    });

    if (errors?.length || !user) {
      return;
    }

    const updateResult = await this.client.models.User.update({
      id: userId,
      communitiesCount: this._clampToZero(
        this._toNumber(user.communitiesCount) + communitiesDelta,
      ),
      membershipsCount: this._clampToZero(
        this._toNumber(user.membershipsCount) + membershipsDelta,
      ),
    });

    if (updateResult?.errors?.length) {
      throw updateResult.errors;
    }
  }

  async _adjustUserPostsCount(userId, postsDelta = 0) {
    if (!userId || !postsDelta) {
      return;
    }

    const { data: user, errors } = await this.client.models.User.get({
      id: userId,
    });

    if (errors?.length || !user) {
      return;
    }

    const updateResult = await this.client.models.User.update({
      id: userId,
      postsCount: this._clampToZero(
        this._toNumber(user.postsCount) + postsDelta,
      ),
    });

    if (updateResult?.errors?.length) {
      throw updateResult.errors;
    }
  }

  async _adjustCommunityCounters(
    communityId,
    { membershipsDelta = 0, postsDelta = 0 } = {},
  ) {
    if (!communityId || (!membershipsDelta && !postsDelta)) {
      return;
    }

    const { data: community, errors } = await this.client.models.Community.get(
      { id: communityId },
      {
        selectionSet: ["id", "membershipsCount", "postsCount"],
      },
    );

    if (errors?.length || !community) {
      return;
    }

    const updateResult = await this.client.models.Community.update({
      id: communityId,
      membershipsCount: this._clampToZero(
        this._toNumber(community.membershipsCount) + membershipsDelta,
      ),
      postsCount: this._clampToZero(
        this._toNumber(community.postsCount) + postsDelta,
      ),
    });

    if (updateResult?.errors?.length) {
      throw updateResult.errors;
    }
  }

  async getCommunity(communityId) {
    if (!communityId) {
      return null;
    }

    const { data, errors } = await this.client.models.Community.get(
      { id: communityId },
      {
        selectionSet: [
          "id",
          "name",
          "description",
          "visibility",
          "createdAt",
          "postsCount",
          "membershipsCount",
          "communityOwnerId",
          "communityOwner.id",
          "communityOwner.firstName",
          "communityOwner.lastName",
          "communityOwner.profileImage",
        ],
      },
    );

    if (errors?.length) {
      throw errors;
    }

    return data || null;
  }

  async getGlobalCommunities({ limit = 20, nextToken = null } = {}) {
    const {
      data: communities,
      nextToken: newNextToken,
      errors,
    } = await this.client.models.Community.listCommunitiesByVisibility({
      visibility: "PUBLIC",
      limit,
      nextToken,
      sortDirection: "DESC",
      selectionSet: [
        "id",
        "name",
        "description",
        "visibility",
        "createdAt",
        "postsCount",
        "membershipsCount",
        "communityOwner.id",
        "communityOwner.firstName",
        "communityOwner.lastName",
        "communityOwner.profileImage",
      ],
    });

    if (errors?.length) {
      throw errors;
    }

    return {
      communities: communities || [],
      nextToken: newNextToken || null,
    };
  }

  async getUserCommunities({ userId, limit = 20, nextToken = null } = {}) {
    if (!userId) {
      return {
        communities: [],
        nextToken: null,
      };
    }

    const {
      data: memberships,
      nextToken: newNextToken,
      errors,
    } = await this.client.models.Membership.list({
      filter: {
        userId: {
          eq: userId,
        },
      },
      limit,
      nextToken,
      selectionSet: [
        "community.id",
        "community.name",
        "community.description",
        "community.visibility",
        "community.createdAt",
        "community.postsCount",
        "community.membershipsCount",
        "community.communityOwner.id",
        "community.communityOwner.firstName",
        "community.communityOwner.lastName",
        "community.communityOwner.profileImage",
      ],
    });

    if (errors?.length) {
      throw errors;
    }

    const deduped = new Map();
    (memberships || []).forEach((membership) => {
      const community = membership?.community;
      if (!community?.id) return;
      deduped.set(community.id, community);
    });

    return {
      communities: Array.from(deduped.values()),
      nextToken: newNextToken || null,
    };
  }

  async getJoinedCommunityIds(userId) {
    if (!userId) {
      return [];
    }

    const { data, errors } = await this.client.models.Membership.list({
      filter: {
        userId: {
          eq: userId,
        },
      },
      selectionSet: ["communityId"],
    });

    if (errors?.length) {
      throw errors;
    }

    return Array.from(
      new Set(
        (data || [])
          .map((membership) => membership?.communityId)
          .filter(Boolean),
      ),
    );
  }

  async getUserMembership(communityId, userId) {
    if (!communityId || !userId) return null;

    const { data, errors } = await this.client.models.Membership.list({
      filter: {
        communityId: { eq: communityId },
        userId: { eq: userId },
      },
      limit: 1,
      selectionSet: ["id", "communityId", "userId", "role"],
    });

    if (errors?.length) {
      throw this._toServiceError(errors, "Failed to load membership.");
    }

    return data?.[0] || null;
  }

  async createCommunity(data) {
    if (!data?.communityOwnerId) {
      throw new Error("Community owner is required.");
    }

    const payload = {
      communityOwnerId: data.communityOwnerId,
      name: (data.name || "").trim(),
      description: (data.description || "").trim(),
      visibility: data.visibility || "PUBLIC",
      postsCount: 0,
      membershipsCount: 1,
    };

    if (!payload.name) {
      throw new Error("Community name is required.");
    }

    if (!payload.description) {
      throw new Error("Community description is required.");
    }

    const { data: communityData, errors: communityErrors } =
      await this.client.models.Community.create(payload);

    if (communityErrors?.length) {
      throw this._toServiceError(
        communityErrors,
        "Failed to create community.",
      );
    }

    const membershipResult = await this.client.models.Membership.create({
      communityId: communityData.id,
      userId: data.communityOwnerId,
      role: "ADMIN",
    });

    if (membershipResult?.errors?.length) {
      throw this._toServiceError(
        membershipResult.errors,
        "Failed to create owner membership.",
      );
    }

    try {
      await this._adjustUserCounters(data.communityOwnerId, {
        communitiesDelta: 1,
        membershipsDelta: 1,
      });
    } catch {
      // Non-blocking counter sync.
    }

    return communityData;
  }

  async updateCommunity(communityId, data = {}) {
    if (!communityId) {
      throw new Error("Community id is required.");
    }

    const payload = {
      id: communityId,
    };

    if (typeof data.description === "string") {
      payload.description = data.description.trim();
      if (!payload.description) {
        throw new Error("Community description is required.");
      }
    }

    if (data.visibility === "PUBLIC" || data.visibility === "PRIVATE") {
      payload.visibility = data.visibility;
    }

    const result = await this.client.models.Community.update(payload);

    if (result?.errors?.length) {
      throw this._toServiceError(result.errors, "Failed to update community.");
    }

    return result?.data || null;
  }

  async deleteCommunity(communityId) {
    if (!communityId) {
      throw new Error("Community id is required.");
    }

    const { data: existingCommunity } = await this.client.models.Community.get(
      { id: communityId },
      {
        selectionSet: ["id", "communityOwnerId"],
      },
    );

    let membershipsNextToken = null;
    const memberships = [];

    do {
      const {
        data,
        nextToken: newNextToken,
        errors,
      } = await this.client.models.Membership.list({
        filter: {
          communityId: {
            eq: communityId,
          },
        },
        limit: 200,
        nextToken: membershipsNextToken,
        selectionSet: ["id", "userId"],
      });

      if (errors?.length) {
        throw this._toServiceError(
          errors,
          "Failed to load community memberships.",
        );
      }

      memberships.push(...(data || []));
      membershipsNextToken = newNextToken || null;
    } while (membershipsNextToken);

    let postsNextToken = null;
    const posts = [];

    do {
      const {
        data,
        nextToken: newNextToken,
        errors,
      } = await this.client.models.Post.listCommunityPosts({
        communityId,
        limit: 200,
        nextToken: postsNextToken,
        sortDirection: "DESC",
        selectionSet: ["id", "authorId"],
      });

      if (errors?.length) {
        throw this._toServiceError(errors, "Failed to load community posts.");
      }

      posts.push(...(data || []));
      postsNextToken = newNextToken || null;
    } while (postsNextToken);

    for (const post of posts) {
      if (!post?.id) continue;
      const deletePostResult = await this.client.models.Post.delete({
        id: post.id,
      });

      if (deletePostResult?.errors?.length) {
        throw this._toServiceError(
          deletePostResult.errors,
          "Failed to delete community posts.",
        );
      }
    }

    for (const membership of memberships) {
      if (!membership?.id) continue;
      const deleteMembershipResult = await this.client.models.Membership.delete(
        {
          id: membership.id,
        },
      );

      if (deleteMembershipResult?.errors?.length) {
        throw this._toServiceError(
          deleteMembershipResult.errors,
          "Failed to delete community memberships.",
        );
      }
    }

    const result = await this.client.models.Community.delete({
      id: communityId,
    });

    if (result?.errors?.length) {
      throw this._toServiceError(result.errors, "Failed to delete community.");
    }

    if (existingCommunity?.communityOwnerId) {
      const ownerId = existingCommunity.communityOwnerId;
      const membershipUserIds = Array.from(
        new Set((memberships || []).map((membership) => membership?.userId)),
      ).filter(Boolean);
      const ownerHadMembership = membershipUserIds.includes(ownerId);

      const postsByAuthor = new Map();
      (posts || []).forEach((post) => {
        if (!post?.authorId) return;
        postsByAuthor.set(
          post.authorId,
          this._toNumber(postsByAuthor.get(post.authorId)) + 1,
        );
      });

      try {
        await Promise.all([
          ...membershipUserIds
            .filter((userId) => userId !== ownerId)
            .map((userId) =>
              this._adjustUserCounters(userId, {
                membershipsDelta: -1,
              }),
            ),
          ...Array.from(postsByAuthor.entries()).map(([authorId, count]) =>
            this._adjustUserPostsCount(authorId, -count),
          ),
          this._adjustUserCounters(ownerId, {
            communitiesDelta: -1,
            membershipsDelta: ownerHadMembership ? -1 : 0,
          }),
        ]);
      } catch {
        // Non-blocking counter sync.
      }
    }

    return result?.data || null;
  }

  async joinCommunity({ communityId, userId, role = "VIEWER" }) {
    if (!communityId || !userId) {
      throw new Error("Community and user are required.");
    }

    const existing = await this.getUserMembership(communityId, userId);
    if (existing) {
      return existing;
    }

    const result = await this.client.models.Membership.create({
      communityId,
      userId,
      role,
    });

    if (result?.errors?.length) {
      throw this._toServiceError(result.errors, "Failed to join community.");
    }

    try {
      await Promise.all([
        this._adjustCommunityCounters(communityId, { membershipsDelta: 1 }),
        this._adjustUserCounters(userId, { membershipsDelta: 1 }),
      ]);
    } catch {
      // Non-blocking counter sync.
    }

    return result?.data || null;
  }

  async leaveCommunity({ communityId, userId }) {
    if (!communityId || !userId) {
      throw new Error("Community and user are required.");
    }

    const membership = await this.getUserMembership(communityId, userId);
    if (!membership) {
      return null;
    }

    const result = await this.client.models.Membership.delete({
      id: membership.id,
    });

    if (result?.errors?.length) {
      throw this._toServiceError(result.errors, "Failed to leave community.");
    }

    try {
      await Promise.all([
        this._adjustCommunityCounters(communityId, { membershipsDelta: -1 }),
        this._adjustUserCounters(userId, { membershipsDelta: -1 }),
      ]);
    } catch {
      // Non-blocking counter sync.
    }

    return result?.data || null;
  }
}

const communityService = new CommunityService();

export default communityService;
