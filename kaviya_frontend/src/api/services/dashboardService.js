import api from '../client';

/**
 * Dashboard related API calls.
 * PUBLIC_INTERFACE
 */
const dashboardService = {
  /**
   * Fetch dashboard data for a user.
   * @param {string} userId
   * @returns {Promise<{xp:number, level:number, badges: Array<any>}>}
   */
  getDashboard: async (userId) => {
    const { data } = await api.get(`/dashboard/${encodeURIComponent(userId)}`);
    return data;
  },
};

export default dashboardService;
