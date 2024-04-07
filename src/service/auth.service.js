import axios from 'axios';
import {
  kakaoClientId,
  kakaoRedirectUri,
  kakaoSecret,
  naverClientId,
  naverRedirectUri,
  naverSecretKey
} from '../constant/env';
import {
  kakaoReqMeUrl,
  kakaoTokenUrl,
  naverReqMeUrl,
  naverTokenUrl
} from '../constant/url';
import { auth } from '../utils/firebase';

export default class Auth {
  /**
   * @param {"naver" | "kakao"} provider
   */
  constructor(provider) {
    this.provider = provider;
  }

  async getToken(code) {
    try {
      const body =
        this.provider === 'kakao'
          ? {
              grant_type: 'authorization_code',
              client_id: kakaoClientId,
              redirect_uri: kakaoRedirectUri,
              client_secret: kakaoSecret,
              code
            }
          : {
              grant_type: 'authorization_code',
              client_id: naverClientId,
              client_secret: naverSecretKey,
              redirect_uri: naverRedirectUri,
              code,
              state: 'RAMDOM_STATE'
            };
      const tokenUrl =
        this.provider === 'kakao' ? kakaoTokenUrl : naverTokenUrl;
      const res = await axios.post(tokenUrl, new URLSearchParams(body));
      return res.data;
    } catch (error) {
      throw new Error('토큰 요청 Error: ', error);
    }
  }

  async getUser(token) {
    try {
      const reqTokenUrl =
        this.provider === 'kakao' ? kakaoReqMeUrl : naverReqMeUrl;
      const res = await axios.get(reqTokenUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error) {
      throw new Error('유저정보 요청 error: ', error);
    }
  }

  async updateOrCreateUser(user, refreshToken) {
    const properties =
      this.provider === 'kakao'
        ? {
            uid: `kakao:${user.id}`,
            provider: 'kakao',
            displayName: user.kakao_account?.profile?.nickname,
            email: user.kakao_account?.email,
            refreshToken
          }
        : {
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
  }

  // refreshAccessToken 관리를 어떻게?
  // async refreshAccessToken(refreshToken) {
  //   try {
  //     const config = {
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  //       }
  //     };

  //     const params = new URLSearchParams();
  //     params.append('grant_type', 'refresh_token');
  //     params.append('client_id', kakaoClientId);
  //     params.append('refresh_token', refreshToken);

  //     const response = await axios.post(kakaoTokenUrl, params, config);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error refreshing access token:', error);
  //     throw error;
  //   }
  // }
}
