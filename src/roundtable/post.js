import { generateClient } from "aws-amplify/api";
// import { Amplify } from "aws-amplify";
// import outputs from "../../amplify_outputs.json";

/*
  This is implemented to: Amplify has not been configured. Please call Amplify.configure() before using this service.
*/
// Amplify.configure(outputs);

class PostService {
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

  async _adjustUserPostsCount(userId, delta = 0) {
    if (!userId || !delta) return;

    const { data: user, errors } = await this.client.models.User.get({
      id: userId,
    });

    if (errors?.length || !user) return;

    const updateResult = await this.client.models.User.update({
      id: userId,
      postsCount: this._clampToZero(this._toNumber(user.postsCount) + delta),
    });

    if (updateResult?.errors?.length) {
      throw updateResult.errors;
    }
  }

  async _adjustCommunityPostsCount(communityId, delta = 0) {
    if (!communityId || !delta) return;

    const { data: community, errors } = await this.client.models.Community.get(
      { id: communityId },
      {
        selectionSet: ["id", "postsCount"],
      },
    );

    if (errors?.length || !community) return;

    const updateResult = await this.client.models.Community.update({
      id: communityId,
      postsCount: this._clampToZero(
        this._toNumber(community.postsCount) + delta,
      ),
    });

    if (updateResult?.errors?.length) {
      throw updateResult.errors;
    }
  }

  async getPost(postId) {
    if (!postId) {
      return null;
    }

    const { data: post, errors } = await this.client.models.Post.get(
      { id: postId },
      {
        selectionSet: [
          "id",
          "title",
          "content",
          "visibility",
          "createdAt",
          "author.id",
          "author.firstName",
          "author.lastName",
          "author.profileImage",
          "community.id",
          "community.name",
        ],
      },
    );

    if (errors?.length) {
      throw errors;
    }

    return post || null;
  }

  async getGlobalPosts({ limit = 10, nextToken = null } = {}) {
    const {
      data: posts,
      nextToken: newNextToken,
      errors,
    } = await this.client.models.Post.listPostsByVisibility({
      visibility: "PUBLIC",
      limit,
      nextToken,
      sortDirection: "DESC", // sorts by createdAt
      selectionSet: [
        "id",
        "title",
        "content",
        "createdAt",
        "author.id",
        "author.firstName",
        "author.lastName",
        "author.profileImage",
        "community.id",
        "community.name",
      ],
    });

    if (errors) {
      throw errors;
    }

    return {
      posts: posts || [],
      nextToken: newNextToken || null,
    };
  }

  async getCommunitiesPosts({
    communityIds = [],
    limit = 20,
    nextToken = null,
  } = {}) {
    const normalizedCommunityIds = Array.from(
      new Set((communityIds || []).filter(Boolean)),
    );

    if (normalizedCommunityIds.length === 0) {
      return { posts: [], nextToken: null };
    }

    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20));

    // LIMIT FAN-OUT (VERY IMPORTANT)
    const MAX_COMMUNITIES = 10;
    const activeCommunityIds = normalizedCommunityIds.slice(0, MAX_COMMUNITIES);

    // Restore cursors
    let communityCursors = {};
    if (nextToken?.mode === "multi-community") {
      communityCursors = nextToken.communityCursors || {};
    }

    // Distribute limit across communities
    const perCommunityLimit = Math.ceil(safeLimit / activeCommunityIds.length);

    const results = await Promise.all(
      activeCommunityIds.map(async (communityId) => {
        const res = await this.client.models.Post.listCommunityPosts({
          communityId,
          limit: perCommunityLimit,
          nextToken: communityCursors[communityId] || null,
          sortDirection: "DESC",
          selectionSet: [
            "id",
            "title",
            "content",
            "createdAt",
            "author.id",
            "author.firstName",
            "author.lastName",
            "author.profileImage",
            "community.id",
            "community.name",
          ],
        });

        if (res.errors?.length) {
          throw this._toServiceError(
            res.errors,
            "Failed to fetch community posts.",
          );
        }

        return {
          communityId,
          posts: res.data || [],
          nextToken: res.nextToken || null,
        };
      }),
    );

    // Merge and globally sort
    const merged = results
      .flatMap((r) => r.posts)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Take only required amount AFTER merge
    const selectedPosts = merged.slice(0, safeLimit);

    // Track which communities actually contributed posts
    const usedCommunities = new Set(selectedPosts.map((p) => p.community?.id));

    // Build nextToken carefully
    const newCommunityCursors = {};
    let hasMore = false;

    for (const r of results) {
      // Only advance cursor if:
      // - community contributed posts OR
      // - it still has more data
      if (r.nextToken) {
        newCommunityCursors[r.communityId] = r.nextToken;
        hasMore = true;
      } else if (!usedCommunities.has(r.communityId)) {
        // keep cursor unchanged if unused (prevents skipping)
        if (communityCursors[r.communityId]) {
          newCommunityCursors[r.communityId] = communityCursors[r.communityId];
          hasMore = true;
        }
      }
    }

    return {
      posts: selectedPosts,
      nextToken: hasMore
        ? {
            mode: "multi-community",
            communityCursors: newCommunityCursors,
          }
        : null,
    };
  }

  async getCommunityPosts({ communityId, limit = 20, nextToken = null } = {}) {
    if (!communityId) {
      return {
        posts: [],
        nextToken: null,
      };
    }

    const {
      data: posts,
      nextToken: newNextToken,
      errors,
    } = await this.client.models.Post.listCommunityPosts({
      communityId,
      limit,
      nextToken,
      sortDirection: "DESC",
      selectionSet: [
        "id",
        "title",
        "content",
        "visibility",
        "createdAt",
        "author.id",
        "author.firstName",
        "author.lastName",
        "author.profileImage",
        "community.id",
        "community.name",
      ],
    });

    if (errors?.length) {
      throw errors;
    }

    return {
      posts: posts || [],
      nextToken: newNextToken || null,
    };
  }

  async getUserPosts({ userId, limit = 10, nextToken = null } = {}) {
    if (!userId) {
      return {
        posts: [],
        nextToken: null,
      };
    }

    const {
      data: posts,
      nextToken: newNextToken,
      errors,
    } = await this.client.models.Post.listAuthorPosts({
      authorId: userId,
      limit,
      nextToken,
      sortDirection: "DESC",
      selectionSet: [
        "id",
        "title",
        "content",
        "createdAt",
        "author.id",
        "author.firstName",
        "author.lastName",
        "author.profileImage",
        "community.id",
        "community.name",
      ],
    });

    if (errors?.length) {
      throw this._toServiceError(errors, "Failed to load user posts.");
    }

    return {
      posts: posts || [],
      nextToken: newNextToken || null,
    };
  }

  async createPost(data) {
    if (!data?.authorId) {
      throw new Error("Author is required to create a post.");
    }

    const title = (data.title || "").trim();
    const content = (data.content || "").trim();

    if (!title) {
      throw new Error("Title is required.");
    }

    if (!content) {
      throw new Error("Content is required.");
    }

    if (!data.visibility) {
      data.visibility = "PUBLIC";
    }

    if (data.visibility !== "PUBLIC" && data.visibility !== "COMMUNITY_ONLY") {
      data.visibility = "PUBLIC";
    }

    const payload = {
      authorId: data.authorId,
      title,
      content,
      visibility: data.visibility,
    };

    if (data.communityId) {
      payload.communityId = data.communityId;
    }

    const result = await this.client.models.Post.create(payload);

    if (result?.errors?.length) {
      throw this._toServiceError(result.errors, "Failed to create post.");
    }

    try {
      await Promise.all([
        this._adjustUserPostsCount(data.authorId, 1),
        payload.communityId
          ? this._adjustCommunityPostsCount(payload.communityId, 1)
          : Promise.resolve(),
      ]);
    } catch {
      // Non-blocking counter sync.
    }

    return result?.data || null;
  }

  async updatePost(postId, data = {}) {
    if (!postId) {
      throw new Error("Post id is required.");
    }

    const payload = {
      id: postId,
    };

    if (typeof data.title === "string") {
      payload.title = data.title.trim();
      if (!payload.title) {
        throw new Error("Title is required.");
      }
    }

    if (typeof data.content === "string") {
      payload.content = data.content.trim();
      if (!payload.content) {
        throw new Error("Content is required.");
      }
    }

    if (data.visibility === "PUBLIC" || data.visibility === "COMMUNITY_ONLY") {
      payload.visibility = data.visibility;
    }

    const result = await this.client.models.Post.update(payload);

    if (result?.errors?.length) {
      throw this._toServiceError(result.errors, "Failed to update post.");
    }

    return result?.data || null;
  }
  async deletePost(postId) {
    if (!postId) {
      throw new Error("Post id is required.");
    }

    const { data: existingPost, errors: fetchErrors } =
      await this.client.models.Post.get({
        id: postId,
      });

    if (fetchErrors?.length) {
      throw fetchErrors;
    }

    if (!existingPost) {
      return null;
    }

    const result = await this.client.models.Post.delete({
      id: postId,
    });

    if (result?.errors?.length) {
      throw this._toServiceError(result.errors, "Failed to delete post.");
    }

    try {
      await Promise.all([
        this._adjustUserPostsCount(existingPost.authorId, -1),
        existingPost.communityId
          ? this._adjustCommunityPostsCount(existingPost.communityId, -1)
          : Promise.resolve(),
      ]);
    } catch {
      // Non-blocking counter sync.
    }

    return result?.data || null;
  }
  async editPost() {
    // Owner only
  }

  async createReaction() {
    // eye, thumbs-up etc..
  }
}

const postService = new PostService();

export default postService;
