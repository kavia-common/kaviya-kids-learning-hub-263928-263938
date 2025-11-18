import api from '../client';

/**
 * Auth related API calls.
 * PUBLIC_INTERFACE
 */
const authService = {
  /** Signup a user
   * @param {{name?: string, email: string, password: string, role?: 'kid'|'parent'}} payload
   * @returns {Promise<{token?: string, user?: any, message?: string}>}
   */
  signup: async (payload) => {
    const { data } = await api.post('/signup', payload);
    return data;
  },

  /** Login a user
   * @param {{email: string, password: string}} payload
   * @returns {Promise<{token: string, user?: any}>}
   */
  login: async (payload) => {
    const { data } = await api.post('/login', payload);
    return data;
  },
};

export default authService;
