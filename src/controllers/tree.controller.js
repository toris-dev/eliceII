import { Router } from 'express';
import verifyAuthToken from '../middleware/oauth.middleware';
import TreeService from '../service/tree.service';

export const treeRouter = Router();
const treeService = new TreeService();
// 트리 생성 , 기존에 트리가 있는지 검사 O
treeRouter.post('/add', verifyAuthToken, async (req, res) => {
  try {
    const { uid, name } = req.user;
    const treeRes = await treeService.createTree(uid, name);

    if (treeRes.error) {
      // 트리가 존재한다면 return
      return res.status(404).json(treeRes);
    }

    res.status(200).json(treeRes);
  } catch (error) {
    res.status(500).json({
      message: '트리가 생성되지 않았습니다.'
    });
  }
});
