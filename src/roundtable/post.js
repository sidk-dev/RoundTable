class PostService {
  constructor() {}

  async getPost() {}
  async getGlobalPosts() {}
  async getUserPosts() {
    // From Profile.
  }

  async createPost() {
    // Only image submissions allowed for now.
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
