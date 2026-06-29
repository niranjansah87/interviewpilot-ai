/**
 * Route path constants.
 * All API and page routes defined in one place.
 */

export const routes = {
  // Pages
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',

  // Auth API
  apiAuthRegister: '/api/v1/auth/register',
  apiAuthLogin: '/api/v1/auth/login',
  apiAuthLogout: '/api/v1/auth/logout',
  apiAuthRefresh: '/api/v1/auth/refresh',

  // User API
  apiUsersMe: '/api/v1/users/me',

  // Interview API
  apiInterviews: '/api/v1/interviews',
  apiInterview: (id: string) => `/api/v1/interviews/${id}`,
  apiInterviewTranscript: (id: string) => `/api/v1/interviews/${id}/transcript`,
  apiInterviewReport: (id: string) => `/api/v1/interviews/${id}/report`,

  // Health
  apiHealth: '/api/health',
} as const;

export type RouteKey = keyof typeof routes;
