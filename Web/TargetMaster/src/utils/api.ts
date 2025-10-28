// 동적으로 API URL 결정
const getApiBaseUrl = () => {
  // 환경변수가 있으면 우선 사용
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 브라우저의 호스트명을 기반으로 API URL 생성
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const port = import.meta.env.VITE_API_PORT || '3001';
  
  // localhost인 경우 그대로 localhost 사용 (PC에서 테스트할 때)
  if (host === 'localhost' || host === '127.0.0.1') {
    return `http://localhost:3001/api`;
  }
  
  // 모바일이나 다른 기기에서 접속한 경우 해당 호스트 사용
  return `${protocol}//${host}:${port}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface User {
  id: number;
  user_id: string;
  name: string;
  gender: string;
  organization: string;
  event_type?: string;
  registration_year?: number;
  social_provider?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  user_id: string;
  password: string;
  name: string;
  gender: string;
  organization: string;
  event_type: string;
}

export interface SocialLoginData {
  provider: string;
  social_id: string;
  name: string;
  email?: string;
}

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch (_) {
      // JSON이 아닌 응답일 경우 기본 에러 메시지 생성
      data = { success: false, message: response.statusText || 'API 응답 파싱 실패' } as ApiResponse<T>;
    }
    
    if (!response.ok) {
      // 401 등 에러 메시지 정리
      const message = data?.message || response.statusText || 'API 요청 실패';
      throw new Error(message);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const authAPI = {
  login: async (user_id: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ user_id, password }),
    });
  },

  register: async (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  socialLogin: async (data: SocialLoginData): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest<LoginResponse>('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyToken: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest<{ user: User }>('/auth/verify');
  },

  getUserProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest<{ user: User }>('/user/profile');
  },
};

export const trainingAPI = {
  createSession: async (data: {
    session_name: string;
    distance?: number;
    target_type?: string;
    arrow_count?: number;
  }): Promise<ApiResponse<{ session: any }>> => {
    return apiRequest<{ session: any }>('/training/session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSession: async (sessionId: number): Promise<ApiResponse<{ session: any }>> => {
    return apiRequest<{ session: any }>(`/training/session/${sessionId}`);
  },

  getScores: async (trainingId: number, roundNumber: number): Promise<ApiResponse<{ scores: any[] }>> => {
    return apiRequest<{ scores: any[] }>(`/training/scores/${trainingId}/${roundNumber}`);
  },

  getTrainingSessions: async (): Promise<ApiResponse<{ sessions: any[] }>> => {
    return apiRequest<{ sessions: any[] }>('/training/sessions');
  },

  recordScore: async (data: {
    training_id: number;
    round_number: number;
    score: number;
    arrow_number: number;
  }): Promise<ApiResponse> => {
    return apiRequest('/training/score', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  deleteScore: async (trainingId: number, roundNumber: number, arrowNumber: number): Promise<ApiResponse<{ total_score: number }>> => {
    return apiRequest<{ total_score: number }>(`/training/scores/${trainingId}/${roundNumber}/${arrowNumber}`, {
      method: 'DELETE',
    });
  },
  deleteSession: async (sessionId: number): Promise<ApiResponse> => {
    return apiRequest(`/training/session/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

export default authAPI;
