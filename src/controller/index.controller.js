import express from 'express';
import { userRouter } from './user/index.controller';

export const router = express.Router();

router.use('/oauth', userRouter);
