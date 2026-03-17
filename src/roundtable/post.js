import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

/*
  This is implemented to: Amplify has not been configured. Please call Amplify.configure() before using this service.
*/
Amplify.configure(outputs);

class PostService {
  constructor() {
    /**
     * @type {import('aws-amplify/data').Client<import('../../amplify/data/resource').Schema>}
     */
    this.client = generateClient();
  }

  async getPost() {}

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

  async getUserPosts() {
    // From Profile.
  }

  async createPost(data) {
    if (!data.visibility) {
      data.visibility = "PUBLIC";
    }

    // console.log("data", data);

    // Only image submissions allowed for now.
    const result = await this.client.models.Post.create({
      ...data,
    });

    // console.log("result: ", result);

    return result;
  }
  async deletePost() {
    // Owner only
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
