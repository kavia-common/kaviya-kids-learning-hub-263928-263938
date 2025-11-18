import api from '../client';

/**
 * Auth related API calls.
 * PUBLIC_INTERFACE
 */
const authService = {
  /** Signup a user
   * @param {{username?: string, email?: string, password: string, role?: 'kid'|'parent'}} payload
   * @returns {Promise<{token?: string, user?: any, message?: string}>}
   */
  signup: async (payload) => {
    try {
      // Backend expects username + password + role
      const body = {
        username: payload.username || payload.email, // allow email alias to map to username
        password: payload.password,
        role: payload.role || 'parent',
      };
      const { data } = await api.post('/api/signup', body);
      return data;
    } catch (err) {
      // Normalize axios error shape from interceptor
      throw err;
    }
  },

  /** Login a user
   * @param {{username?: string, email?: string, password: string}} payload
   * @returns {Promise<{token: string, user?: any}>}
   */
  login: async (payload) => {
    try {
      const body = {
        username: payload.username || payload.email,
        password: payload.password,
      };
      const { data } = await api.post('/api/login', body);
      return data;
    } catch (err) {
      throw err;
    }
  },

  /** Health check to verify API connectivity.
   * PUBLIC_INTERFACE
   * @returns {Promise<{message:string}>}
   */
  health: async () => {
    const { data } = await api.get('/');
    return data;
  },
};

export default authService;
