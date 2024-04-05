import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { frontendUrl } from '../constant/url';

import {
  getKakaoToken,
  getKakaoUser,
  kakaoUpdateOrCreateUser
} from '../service/kakaoAuth.service';
import {
  getNaverToken,
  getNaverUser,
  naverUpdateOrCreateUser
} from '../service/naverAuth.service';
import { db } from '../utils/firebase';

export const oauthRouter = Router();

oauthRouter.get('/kakao', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: 'code is a required parameter.'
      });
    }

    const response = await getKakaoToken(code);
    const token = response.access_token;
    const kakaoUser = await getKakaoUser(token);
    const userCheck = await db
      .collection('users')
      .where('uid', '==', kakaoUser.id)
      .get();
    let authUser;
    try {
      authUser = await kakaoUpdateOrCreateUser(
        kakaoUser,
        response.refresh_token
      );
    } catch (updateOrCreateError) {
      console.error('Error updating or creating user:', updateOrCreateError);
      throw new Error('유저 업데이트 또는 생성 에러');
    }
    // jwt 생성
    const accessToken = jwt.sign(
      { uid: authUser.uid },
      process.env.JWT_SCRET_KEY,
      {
        expiresIn: '24h'
      }
    );
    // home 으로 redirect
    if (userCheck) {
      return res
        .cookie('accessToken', accessToken, { httpOnly: true })
        .cookie('kakaoToken', token)
        .redirect(frontendUrl);
    }
    // 질문입력 redirect
    return res
      .cookie('accessToken', accessToken, { httpOnly: true })
      .cookie('kakaoToken', token)
      .redirect(frontendUrl);
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ message: error });
  }
});

oauthRouter.get('/naver', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: 'code is a required parameter.'
      });
    }
    const response = await getNaverToken(code); // 네이버 OAuth를 통해 액세스 토큰을 받아옴
    const naverUser = await getNaverUser(response.data.access_token); // 액세스 토큰을 사용하여 네이버 사용자 정보를 가져옴
    // 이후에 필요한 처리를 수행하고 클라이언트에게 응답을 보냄
    let authUser;
    try {
      authUser = await naverUpdateOrCreateUser(
        naverUser.response,
        response.refresh_token
      );
    } catch (updateOrCreateError) {
      console.error('Error updating or creating user:', updateOrCreateError);
      throw new Error(updateOrCreateError);
    }

    const accessToken = jwt.sign(
      { uid: authUser.uid },
      process.env.JWT_SCRET_KEY,
      {
        expiresIn: '24h'
      }
    );
    return res
      .cookie('accessToken', accessToken, { httpOnly: true })
      .cookie('naverToken', response.data.access_token)
      .redirect(frontendUrl);
  } catch (error) {
    res.status(404).json({ message: '네이버 로그인에 실패하였습니다.' });
    throw new Error(error);
  }
});
