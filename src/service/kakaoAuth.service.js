import axios from 'axios';
import { auth } from '../utils/firebase';

export const getToken = async (code) => {
  const body = {
    grant_type: 'authorization_code',
    client_id: 'c84840525d9cdbf1a8ba40a6b6f62089',
    redirect_uri: 'http://localhost:5173/kakaotalk',
    code
  };

  const res = await axios.post(
    'https://kauth.kakao.com/oauth/token',
    new URLSearchParams(body)
  );
  console.log(res);
  return res.data;
};
export const getKakaoUser = async (token) => {
  const res = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
export const updateOrCreateUser = async (user) => {
  const kakaoAccount = user.kakao_account;
  const properties = {
    uid: `kakao:${user.id}`,
    provider: 'KAKAO',
    displayName: kakaoAccount?.profile?.nickname,
    email: kakaoAccount?.email
  };

  try {
    return await auth.updateUser(properties.uid, properties);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // eslint-disable-next-line no-return-await
      return await auth.createUser(properties);
    }
    throw error;
  }
};
