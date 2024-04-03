import axios from 'axios';
import { auth } from '../utils/firebase';

export const getToken = async (code) => {
  const body = {
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: process.env.KAKAO_REDIRECT_URI,
    code
  };

  const res = await axios.post(
    'https://kauth.kakao.com/oauth/token',
    new URLSearchParams(body)
  );
  return res.data;
};

// id_token 은 저장해도 될 것 같다.
// DB저장 -> access_token(선택), refresh_token(필수)
export const getKakaoUser = async (token) => {
  const res = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(res);
  return res.data;
};
export const updateOrCreateUser = async (user) => {
  const kakaoAccount = user.kakao_account;
  const properties = {
    uid: `kakao:${user.id}`,
    provider: 'kakao',
    displayName: kakaoAccount?.profile?.nickname,
    email: kakaoAccount?.email
  };

  try {
    return await auth.updateUser(properties.uid, properties);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return auth.createUser(properties);
    }
    throw error;
  }
};

export async function refreshAccessToken(refreshToken) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    };

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', process.env.KAKAO_CLIENT_ID);
    params.append('refresh_token', refreshToken);

    const response = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      params,
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}
