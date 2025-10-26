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

console.log('API Base URL:', API_BASE_URL);

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
  
  console.log('API 요청 URL:', url);
  console.log('API 요청 옵션:', options);
  
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
    console.log('fetch 요청 시작:', url);
    const response = await fetch(url, config);
    console.log('응답 상태:', response.status, response.statusText);
    const data = await response.json();
    console.log('응답 데이터:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'API 요청 실패');
    }
    
    return data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    console.error('오류 상세:', error instanceof Error ? error.message : String(error));
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

export default authAPI;
