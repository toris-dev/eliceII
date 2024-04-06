import { Router } from 'express';
import firebase from 'firebase-admin';
import verifyAuthToken from '../middleware/oauth.middleware';
import { db, storage } from '../utils/firebase';

export const messageRouter = Router();

// 메시지 1개 받아오기 O
messageRouter.get('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const messageRef = await db.collection('messages').doc(messageId).get();

    if (!messageRef.exists) {
      console.error('메시지를 찾을 수 없습니다.');
      return res.status(404).send({ error: '메시지를 찾을 수 없습니다.' });
    }

    const messageData = messageRef.data();
    res.json(messageData);
  } catch (error) {
    console.error('메시지 1개 받아오기 에러:', error);
    res.status(500).send({ error: '메시지를 가져오지 못했습니다.' });
  }
});

// 메시지 작성 O
messageRouter.post('/:treeId/write', async (req, res) => {
  try {
    const { treeId } = req.params;

    const docRef = db.collection('tree').doc(treeId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      // 문서가 존재하는 경우
      return res.status(404).json({ message: '트리가 존재하지 않습니다.' });
    }
    await docRef.update({ count: firebase.firestore.FieldValue.increment(1) });

    const { message, icon, coordinate, uid } = req.body;
    const messageRef = await db.collection('messages').add({
      treeId,
      message,
      icon,
      uid,
      created_at: new Date(),
      coordinate: coordinate ?? { x: 0, y: 0 }
    });
    const messageId = (await messageRef.get()).id;

    res.status(200).json({
      message: '메시지 작성 완료',
      messageId
    });
  } catch (error) {
    console.error('Error:', error);

    if (error.code === 404) {
      res.status(404).json({ error: '질문 메시지 작성에 실패하였습니다.' });
    }
    res.status(500).json({ error: '질문 메시지 작성에 실패하였습니다.' });
  }
});

// 메시지 삭제 O
messageRouter.delete(
  '/:messageId/delete',
  verifyAuthToken,
  async (req, res) => {
    const { messageId } = req.params;
    const { uid } = req.user;
    try {
      // questions 컬렉션에서 questionId로 문서 조회
      const messageDocSnapshot = await db
        .collection('messages')
        .doc(messageId)
        .get();
      const { treeId } = messageDocSnapshot.data();
      const docRef = db.collection('tree').doc(treeId);

      if (!messageDocSnapshot.exists) {
        return res.status(404).json({ message: '질문을 찾을 수 없습니다.' });
      }
      if (messageDocSnapshot.data().uid !== uid) {
        return res.status(404).json({
          message: '호스트가 아닌 이용자는 삭제할 수 없습니다.'
        });
      }

      await messageDocSnapshot.ref.delete();

      await docRef.update({
        count: firebase.firestore.FieldValue.increment(-1)
      });

      res.status(200).send({
        message: '메시지를 성공적으로 삭제하였습니다.',
        messageData: messageDocSnapshot.data().id
      });
    } catch (error) {
      console.error('질문 삭제 도중 오류가 발생하였습니다.', error);
      res.status(500).send({ message: '메시지를 삭제하지 못했습니다.' });
    }
  }
);

// 모든 아이콘 보여주기
messageRouter.get('/icon/all', async (req, res) => {
  try {
    const [files] = await storage.bucket().getFiles({
      prefix: 'icons/'
    });
    const iconUrlsPromises = files.map((file) =>
      file.getSignedUrl({
        action: 'read',
        expires: '03-17-2025' // 만료 시간
      })
    );

    const iconUrlsArray = await Promise.all(iconUrlsPromises);
    const flattenedUrls = iconUrlsArray
      .flat()
      .slice(1)
      .map((urlArr) => urlArr.toString());

    res.status(200).json(flattenedUrls);
  } catch (error) {
    res.status(404).json({
      message: `아이콘을 불러오지 못했습니다. error: ${error}`
    });
  }
});

// 트리 메시지 전체 받아오기 O
messageRouter.get('/:treeId/all', async (req, res) => {
  try {
    const { treeId } = req.params;
    const messages = [];

    const doc = await db
      .collection('messages')
      .where('treeId', '==', treeId)
      .get();
    if (doc.empty) {
      return res.status(404).json({ error: '메시지를 찾을 수 없습니다.' });
    }
    doc.forEach((msg) => messages.push(msg.data()));

    res.json(messages);
  } catch (error) {
    console.error('Error:', error);
    if (error.code === 404) {
      return res
        .status(404)
        .json({ message: '메시지를 가져오지 못했습니다.', error });
    }
    return res
      .status(500)
      .json({ message: '메시지를 가져오지 못했습니다.', error });
  }
});
