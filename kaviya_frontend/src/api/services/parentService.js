import api from '../client';

/**
 * Parent view related API calls.
 * PUBLIC_INTERFACE
 */
const parentService = {
  /**
   * Fetch parent dashboard data for a child.
   * @param {string} userId
   * @returns {Promise<any>}
   */
  getParentView: async (userId) => {
    const { data } = await api.get(`/parent/${encodeURIComponent(userId)}`);
    return data;
  },
};

export default parentService;
