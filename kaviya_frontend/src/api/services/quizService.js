import api from '../client';

/**
 * Quiz related API calls.
 * PUBLIC_INTERFACE
 */
const quizService = {
  /**
   * Fetch quiz questions by subject.
   * @param {string} subject
   * @returns {Promise<{subject:string, questions:Array<{id:string, question:string, options:string[]}>}>}
   */
  getQuizBySubject: async (subject) => {
    const { data } = await api.get(`/quiz/${encodeURIComponent(subject)}`);
    return data;
  },

  /**
   * Submit quiz answers for evaluation.
   * @param {{userId:string, subject:string, answers:Array<{questionId:string, answer:string}>}} payload
   * @returns {Promise<{score:number, correct:number, total:number, details?:any}>}
   */
  submitQuiz: async (payload) => {
    const { data } = await api.post('/submit-quiz', payload);
    return data;
  },
};

export default quizService;
