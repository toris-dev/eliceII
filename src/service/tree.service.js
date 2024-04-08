import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/firebase';

export default class TreeService {
  /**
   *
   * @param {string} uid - 사용자 고유번호
   * @param {string} name - 사용자 이름
   * @returns {Promise<{create_at: Date, name: string,treeId: string, treeImage:string,uid: string}>|{error: string, tree: {uid: string}}>}
   */
  async createTree(uid, name) {
    const treeSnapshot = await db
      .collection('tree')
      .where('uid', '==', uid)
      .select('uid')
      .get();

    if (!treeSnapshot.empty) {
      return {
        error: '트리가 존재합니다.',
        tree: treeSnapshot.docs[0].data()
      };
    }
    const id = uuidv4().replace(/-/g, '');
    const treeRef = db.collection('tree').doc(id);

    treeRef.set({
      treeId: id,
      uid,
      name,
      created_at: new Date(),
      treeImage: ''
    });

    return (await treeRef.get()).data();
  }

  /**
   *
   * @param {string} uid user에 uid값
   * @param {Array<string>} message 질문에 대한 응답값
   */
  // eslint-disable-next-line class-methods-use-this
  async createQuestion(uid, questions) {
    try {
      const querySnapshot = await db
        .collection('tree')
        .where('uid', '==', uid)
        .get();
      const docRef = querySnapshot.docs[0].ref;
      await docRef.update({
        question: questions
      });
      return (await docRef.get()).data();
    } catch (error) {
      console.error('질문 생성 오류', error);
      throw new Error(error);
    }
  }
}
