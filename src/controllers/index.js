import express from 'express';
import { questionRouter } from './question.controller';
import { questionnaireRouter } from './questionnaire.controller';
import { userRouter } from './user.controller';

export const router = express.Router();

router.use('/oauth', userRouter); // 소셜로그인에 대한 Router
router.use('/questionnaire', questionnaireRouter); // 메시지에 대한 Router
router.use('/question', questionRouter); // 질문지에 대한 Router
