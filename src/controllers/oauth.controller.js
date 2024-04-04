import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { frontendUrl } from '../constant/url';
import {
  getKakaoUser,
  getToken,
  updateOrCreateUser
} from '../service/kakaoAuth.service';
import { getNaverToken, getNaverUser } from '../service/naverAuth.service';
import { userService } from '../service/user.service';
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

    const response = await getToken(code);
    const token = response.access_token;
    const kakaoUser = await getKakaoUser(token);
    const userCheck = await db
      .collection('users')
      .where('uid', '==', kakaoUser.id)
      .get();
    let authUser;
    try {
      authUser = await updateOrCreateUser(kakaoUser, response.refresh_token);
    } catch (updateOrCreateError) {
      console.error('Error updating or creating user:', updateOrCreateError);
      throw new Error('유저 업데이트 또는 생성 에러');
    }
    let accessToken;
    // jwt 생성
    try {
      accessToken = jwt.sign({ uid: authUser.uid }, process.env.JWT_SCRET_KEY, {
        expiresIn: '24h'
      });
    } catch (createTokenError) {
      console.error('Error creating custom token:', createTokenError);
      throw new Error('커스텀 토큰 생성 에러');
    }

    if (userCheck.empty) {
      await userService.userCreate({
        uid: kakaoUser.id,
        name: kakaoUser.kakao_account.profile.nickname,
        email: kakaoUser.kakao_account.email,
        question: [],
        messageCount: 0,
        refreshToken: response.refresh_token
      });
    }

    return res
      .cookie('accessToken', accessToken, { httpOnly: true })
      .cookie('kakaoToken', token)
      .redirect(frontendUrl);
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ message: '로그인에 실패하였습니다.' });
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
    return res
      .status(200)
      .json({ message: '네이버 로그인 성공', user: naverUser });
  } catch (error) {
    res.status(404).json({ message: '네이버 로그인에 실패하였습니다.' });
    throw new Error(error);
  }
});
