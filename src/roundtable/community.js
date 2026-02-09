class CommunityService {
  constructor() {}

  async getCommunity() {}
  async getGlobalCommunities() {}
  async getUserCommunities() {
    // From Profile.
  }

  async createCommunity() {
    // Block user from creating more than one community per day. (In Backend)
  }
  async deleteCommunity() {
    // Owner only
  }
  async editCommunity() {
    // Owner only
    // Includes remove any member from the community.
  }
  async approveOrRejectUserRequest() {
    // Owner only
    // Approve or Reject user's request to get into community.
  }

  async getMyRequests() {
    // Owner only
  }
}

const communityService = new CommunityService();

export default communityService;
