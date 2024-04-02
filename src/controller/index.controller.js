import express from 'express';
import { userRouter } from './user/index.controller';
import { questionnaireRouter } from './questionnaire/index.controller';

export const router = express.Router();

router.use('/oauth', userRouter);
router.use('/question', questionnaireRouter);
