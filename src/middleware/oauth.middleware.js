import { verify } from 'jsonwebtoken';
import { jwtSecretKey } from '../constant/env';
import { auth } from '../utils/firebase';
// OIDC 토큰 검증 미들웨어
const verifyAuthToken = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: 'Authorization token is missing.' });
    }
    const { uid } = verify(accessToken, jwtSecretKey);
    const user = await auth.getUser(uid);
    // 검증된 UID를 요청 객체에 추가
    req.user = { uid: user.uid, name: user.displayName };
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(500).json({ message: 'Unauthorizesd' });
  }
};
export default verifyAuthToken;
