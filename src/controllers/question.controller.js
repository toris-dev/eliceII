import { Router } from 'express';
import firebase from 'firebase-admin';
import { db } from '../utils/firebase';

export const questionRouter = Router();

// 메시지 1개 받아오기
questionRouter.get('/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;

    const questionRef = db.collection('questions').doc(questionId);

    res.json({
      question: questionRef.data()
    });
  } catch (error) {
    console.error('메시지 1개 받아오기 에러:', error);
    res.status(500).send({ error: '메시지를 가져오지 못했습니다.' });
  }
});

// 질문 메시지 작성
questionRouter.post('/:questionnaireId/question', async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    const { message, icon } = req.body;
    const questionRef = await db.collection('questions').add({
      message,
      icon,
      created_at: new Date(),
      questionnaireId,
      questionId: 's'
    });

    await db
      .collection('questionnaire')
      .doc(questionnaireId)
      .update({
        questionContent: firebase.firestore.FieldValue.arrayUnion(
          questionRef.id
        ),
        count: firebase.firestore.FieldValue.increment(1)
      });

    res.status(200).json({
      message: '질문 메시지 작성 완료',
      questionId: questionRef.id
    });
  } catch (error) {
    console.error('Error:', error);

    if (error.code === 404) {
      res.status(404).json({ error: '질문 메시지 작성에 실패하였습니다.' });
    }
    res.status(500).json({ error: '질문 메시지 작성에 실패하였습니다.' });
  }
});
// 질문 메시지 삭제
questionRouter.delete('/:questionId', async (req, res) => {
  const { questionId } = req.params;

  try {
    // questions 컬렉션에서 questionId로 문서 조회
    const questionDocSnapshot = await db
      .collection('questions')
      .doc(questionId)
      .get();

    if (!questionDocSnapshot.exists) {
      return res.status(404).send({ error: '질문을 찾을 수 없습니다.' });
    }

    const { questionnaireId } = questionDocSnapshot.data();

    await questionDocSnapshot.ref.delete();

    // questionnaire 컬렉션에서 questionnaireId 문서 조회
    const questionnaireDocSnapshot = await db
      .collection('questionnaire')
      .doc(questionnaireId)
      .get();

    if (!questionnaireDocSnapshot.exists) {
      return res.status(404).send({ error: '질문을 찾을 수 없습니다.' });
    }

    const questionContentArray =
      questionnaireDocSnapshot.data().questionContent || [];
    const updatedQuestionContentArray = questionContentArray.filter(
      (id) => id !== questionId
    );

    // questionnaire document 업데이트
    await questionnaireDocSnapshot.ref.update({
      questionContent: updatedQuestionContentArray,
      count: firebase.firestore.FieldValue.increment(-1)
    });

    res.status(200).send({
      message: '메시지를 성공적으로 삭제하였습니다.',
      question: questionDocSnapshot.data()
    });
  } catch (error) {
    console.error('질문 삭제 도중 오류가 발생하였습니다.', error);
    res
      .status(500)
      .send({ error: '질문을 삭제하고 메시지는 삭제하지 못했습니다.' });
  }
});
