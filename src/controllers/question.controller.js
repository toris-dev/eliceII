import { Router } from 'express';
import verifyAuthToken from '../middleware/oauth.middleware';
import { db } from '../utils/firebase';

export const questionRouter = Router();

// 질문 작성, 미들웨어 추가 예정
questionRouter.post('/', verifyAuthToken, async (req, res) => {
  try {
    const message = req.body;
    const { uid } = req.user;
    // tree 컬렉션에서 uid 필드 값이 미들웨어에서 검사한 uid 와 일치하는 문서 조회
    const querySnapshot = await db
      .collection('tree')
      .where('uid', '==', uid)
      .get();
    const docRef = querySnapshot.docs[0].ref;
    await docRef.update({
      question: message
    });
    res.status(200).json({
      message: '질문이 등록되었습니다.'
    });
  } catch (error) {
    res.status(404).json({
      message: '질문이 등록되지 않았습니다.',
      error
    });
    throw new Error(error);
  }
});
