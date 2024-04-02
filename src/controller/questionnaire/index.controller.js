import { Router } from 'express';
import { db } from '../../utils/firebase';

export const router = Router();

// 질문지 작성
// 요청값: message -> string, 토큰 존재여부 O
router.post('/', (req, res) => {
  res.send(req.body);
});

// 질문지에 대한 메시지 전체 받아오기
router.get('/:questionnaireId', (req, res) => {
  const { questionnaireId } = req.params;
  const messages = db
    .collection('elice')
    .doc('questionList')
    .get(questionnaireId);

  res.json({ questionnaireId: messages });
});

// 메시지 1개 받아오기
router.get('/:questionnaireId/:questionId', async (req, res) => {
  const { questionnaireId, questionId } = req.params;

  const message = db.collection('elice').doc(questionnaireId).get(questionId);

  res.json({
    questionnaireId: message
  });
});

// 질문 메시지 작성
router.get('/:questionnaireId/question', (req, res) => {
  const { questionnaireId } = req.params;
  const { message, icon } = req.body;

  db.collection('elice').doc(questionnaireId).set({
    content: message,
    created_at: new Date(),
    icon
  });

  res.send(req.body);
});

router.delete('/:questionId', (req, res) => {
  const { questionId } = req.params;

  res.send(questionId);
});