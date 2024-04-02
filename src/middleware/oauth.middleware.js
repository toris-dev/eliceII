import { auth } from '../utils/firebase';

// OIDC 토큰 검증 미들웨어
const verifyOidcToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.error('OIDC 토큰 오류:', error);
      return res.status(401).json({ error: 'Unauthorized' });
    });
};
export default verifyOidcToken;
