import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import assert from 'node:assert';
import { before, describe, it } from 'node:test';
import request from 'supertest';
import { port } from '../src/constant/env';
import { router } from '../src/controllers';

const app = express();
before(() => {
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', router);

  app.listen(port, () => {
    console.log('Server Running✔️');
  });
});
// 가짜 사용자 데이터 (테스트를 위해 실제 데이터 대신 사용)
const testUser = {
  uid: process.env.KAKAO_UID
};

// 가짜 질문 데이터
const testQuestions = [
  { nickname: '괴물' },
  { color: 'red' },
  { treeName: '화산귀환' }
];

describe('Tree API 테스트', () => {
  it('이상한 쿠키가 없을 때 처리해야 함', async () => {
    const res = await request(app).post('/api/tree/add').send(testQuestions);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, 'Authorization token is missing.');
  });
  // 개인당 트리 1개
  // it('트리와 질문을 생성', async () => {
  //   // TreeService의 mock 구현
  //   const res = await request(app)
  //     .post('/api/tree/add')
  //     .set(
  //       'Cookie',
  //       'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJrYWthbzozNDE3NzE1MzI2IiwiaWF0IjoxNzEyNzk3OTk1fQ.v7uIgEYNNG2JhSzLY3_2XkqQBlkbvjxQO06zjec3VXk'
  //     ) // 테스트용 토큰
  //     .send(testQuestions);

  //   assert.strictEqual(res.statusCode, 200);
  //   assert.strictEqual(res.body.message, '트리가 생성되었습니다.');
  // });

  it('트리가 이미 존재하는 경우 오류를 반환', async () => {
    const res = await request(app)
      .post('/api/tree/add')
      .set(
        'Cookie',
        'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJrYWthbzozNDE3NzE1MzI2IiwiaWF0IjoxNzEyODMzOTUzLCJleHAiOjE3MTI5MjAzNTN9.fcSN9qbvjkpbQNvlS4KSjqmmMiXAz92TxfE1LGnWPvU'
      )
      .send(testQuestions);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, '트리가 존재합니다.');
    assert.strictEqual(res.body.tree.uid, testUser.uid);
  });

  it('질문이 제공되지 않은 경우 오류를 반환해야 함', async () => {
    const res = await request(app)
      .post('/api/tree/add')
      .set(
        'Cookie',
        'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJrYWthbzozNDE3NzE1MzI2IiwiaWF0IjoxNzEyODMzOTUzLCJleHAiOjE3MTI5MjAzNTN9.fcSN9qbvjkpbQNvlS4KSjqmmMiXAz92TxfE1LGnWPvU'
      );

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.message, '질문을 등록해주세요');
  });
});
