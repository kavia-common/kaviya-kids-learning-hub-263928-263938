import api from '../client';

/**
 * Rewards related API calls.
 * PUBLIC_INTERFACE
 */
const rewardsService = {
  /**
   * Fetch rewards/pet status for user.
   * @param {string} userId
   * @returns {Promise<{petStage?:string, stickers?:Array<any>}>}
   */
  getRewards: async (userId) => {
    const { data } = await api.get(`/rewards/${encodeURIComponent(userId)}`);
    return data;
  },
};

export default rewardsService;
