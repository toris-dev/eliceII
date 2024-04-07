import { Router } from 'express';
import verifyAuthToken from '../middleware/oauth.middleware';
import QuestionService from '../service/question.service';

export const questionRouter = Router();
const question = new QuestionService();

// 질문 작성, 미들웨어 추가 예정
questionRouter.post('/', verifyAuthToken, async (req, res) => {
  try {
    const message = req.body;
    const { uid } = req.user;
    // tree 컬렉션에서 uid 필드 값이 미들웨어에서 검사한 uid 와 일치하는 문서 조회
    const { treeId } = await question.createQuestion(uid, message);
    res.status(200).json({
      message: '질문이 등록되었습니다.',
      treeId
    });
  } catch (error) {
    res.status(500).json({
      message: '질문이 등록되지 않았습니다.'
    });
    throw new Error(error);
  }
});
