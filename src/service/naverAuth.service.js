import axios from 'axios';
import {
  naverClientId,
  naverRedirectUri,
  naverSecretKey
} from '../constant/env';
import { naverReqMeUrl, naverTokenUrl } from '../constant/url';
import { auth } from '../utils/firebase';
// https://nid.naver.com/oauth2.0/authorize GET/POST - 네이버 로그인 인증을 요청합니다.
// https://nid.naver.com/oauth2.0/token GET/POST JSON 접근 토큰의 발급, 갱신, 삭제를 요청합니다.

export const getNaverToken = async (code) => {
  const body = {
    grant_type: 'authorization_code',
    client_id: naverClientId,
    client_secret: naverSecretKey,
    redirect_uri: naverRedirectUri,
    code,
    state: 'RAMDOM_STATE'
  };

  const res = await axios.post(naverTokenUrl, new URLSearchParams(body));

  return res;
};

export const getNaverUser = async (token) => {
  const res = await axios.get(naverReqMeUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
export const naverUpdateOrCreateUser = async (user, refreshToken) => {
  if (!user) {
    throw new Error('로그인하세요');
  }
  const properties = {
    uid: `naver:${user.id}`,
    provider: 'naver',
    displayName: user?.name,
    email: user?.email,
    refreshToken
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
