import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send(req.body);
});

export default router;
