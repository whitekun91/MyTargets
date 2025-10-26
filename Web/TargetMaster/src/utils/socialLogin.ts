// 소셜 로그인 유틸리티 함수들

export interface SocialUser {
  id: string;
  name: string;
  email?: string;
  profile_image?: string;
}

// 카카오 로그인
export const kakaoLogin = () => {
  // 실제 구현에서는 카카오 SDK를 사용해야 합니다
  // 여기서는 데모용으로 간단한 구현을 보여드립니다
  
  const KAKAO_CLIENT_ID = 'your_kakao_client_id'; // 실제 카카오 앱 키로 교체 필요
  const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
  
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  
  // 팝업으로 카카오 로그인 창 열기
  const popup = window.open(
    kakaoAuthUrl,
    'kakaoLogin',
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );

  // 팝업에서 메시지 수신 대기
  const messageListener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === 'KAKAO_LOGIN_SUCCESS') {
      const userData = event.data.user;
      popup?.close();
      window.removeEventListener('message', messageListener);
      return userData;
    }
  };

  window.addEventListener('message', messageListener);
};

// 네이버 로그인
export const naverLogin = () => {
  // 실제 구현에서는 네이버 SDK를 사용해야 합니다
  // 여기서는 데모용으로 간단한 구현을 보여드립니다
  
  const NAVER_CLIENT_ID = 'your_naver_client_id'; // 실제 네이버 앱 키로 교체 필요
  const REDIRECT_URI = `${window.location.origin}/auth/naver/callback`;
  const STATE = 'RANDOM_STATE'; // CSRF 방지를 위한 랜덤 문자열
  
  const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;
  
  // 팝업으로 네이버 로그인 창 열기
  const popup = window.open(
    naverAuthUrl,
    'naverLogin',
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );

  // 팝업에서 메시지 수신 대기
  const messageListener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === 'NAVER_LOGIN_SUCCESS') {
      const userData = event.data.user;
      popup?.close();
      window.removeEventListener('message', messageListener);
      return userData;
    }
  };

  window.addEventListener('message', messageListener);
};

// 데모용 소셜 로그인 (실제 구현 전까지 사용)
export const demoSocialLogin = (provider: string): Promise<SocialUser> => {
  return new Promise((resolve) => {
    // 데모용 사용자 데이터
    const demoUsers = {
      kakao: {
        id: 'kakao_demo_123',
        name: '카카오 사용자',
        email: 'kakao@demo.com',
        profile_image: 'https://via.placeholder.com/100'
      },
      naver: {
        id: 'naver_demo_456',
        name: '네이버 사용자',
        email: 'naver@demo.com',
        profile_image: 'https://via.placeholder.com/100'
      }
    };

    // 1초 후 데모 사용자 데이터 반환
    setTimeout(() => {
      resolve(demoUsers[provider as keyof typeof demoUsers]);
    }, 1000);
  });
};

// 소셜 로그인 콜백 처리 (실제 구현에서는 별도 페이지에서 처리)
export const handleSocialCallback = (provider: string, code: string) => {
  // 실제 구현에서는 서버로 인증 코드를 전송하여 액세스 토큰을 받아야 합니다
  console.log(`${provider} 로그인 콜백 처리:`, code);
  
  // 부모 창에 로그인 성공 메시지 전송
  if (window.opener) {
    window.opener.postMessage({
      type: `${provider.toUpperCase()}_LOGIN_SUCCESS`,
      user: {
        id: `${provider}_demo_${Date.now()}`,
        name: `${provider} 사용자`,
        email: `${provider}@demo.com`
      }
    }, window.location.origin);
  }
  
  window.close();
};
