export const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_KEY}&redirect_uri=${process.env.KAKAO_REDIRECT}&response_type=code`;
export const kakaoReqMeUrl =
  'https://kapi.kakao.com/v2/user/me?secure_resource=true';
