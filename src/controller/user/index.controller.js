import { Router } from 'express';
import * as admin from 'firebase-admin';
import { kakaoUrl } from '../../constant/kakao';
import {
  getKakaoUser,
  getToken,
  updateOrCreateUser
} from '../../service/kakaoAuth.service';

export const userRouter = Router();

// kakao url
userRouter.get('/kakao/url', async (req, res) => {
  const url = kakaoUrl;
  res.status(200).json({
    url
  });
});

userRouter.post('/login', async (req, res) => {
  const { code, type } = req.body;
  console.log(type);
  if (!code) {
    return res.status(400).json({
      code: 400,
      message: 'code is a required parameter.'
    });
  }

  const response = await getToken(code);
  const token = response.access_token;
  const kakaoUser = await getKakaoUser(token);
  const authUser = await updateOrCreateUser(kakaoUser);
  const firebaseToken = await admin
    .auth()
    .createCustomToken(authUser.uid, { provider: 'oidc.kakao' });

  return res.status(200).json({ firebaseToken });
});
