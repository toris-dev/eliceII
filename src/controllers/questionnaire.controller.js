import { Router } from 'express';
import firebase from 'firebase-admin';
import { db } from '../utils/firebase';

export const questionnaireRouter = Router();

// 질문지 작성
// 요청값: message -> string, 토큰 존재여부 O
questionnaireRouter.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    // Firestore에 질문지 데이터 추가
    const newQuestionRef = await db.collection('questionnaire').add({
      message,
      questionContent: [],
      count: 1,
      questionnaireId: 0,
      created_at: new Date()
    });
    res.json({ questionnaireId: newQuestionRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create questionnaire' });
  }
});

// 질문지에 대한 메시지 전체 받아오기
questionnaireRouter.get('/:questionnaireId', async (req, res) => {
  try {
    const { questionnaireId } = req.params;

    const doc = await db.collection('questionnaire').doc(questionnaireId).get();
    if (doc.exists) {
      const questionContentArray = doc.data().questionContent || [];

      // questionContent 배열에 questions ID들로 questions 컬렉션 문서조회
      const querySnapshot = await db
        .collection('questions')
        .where(
          firebase.firestore.FieldPath.documentId(),
          'in',
          questionContentArray
        )
        .get();

      const questions = [];
      querySnapshot.forEach((document) => {
        questions.push({ id: document.id, ...document.data() });
      });

      res.json(questions);
    } else {
      res.status(404).json({ error: '질문 리스트를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('Error:', error);

    if (error.code === 404) {
      res.status(404).json({ error: '질문지를 찾을 수 없습니다.' });
    }
    res.status(500).json({ error: '설문지, 질문을 가져오지 못했습니다.' });
  }
});
