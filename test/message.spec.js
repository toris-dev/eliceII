import assert from 'assert';
import { describe, it } from 'node:test';
import request from 'supertest';
import app from '../src/app';

describe('메시지 API 테스트', () => {
  let messageId; // 메시지 ID를 저장할 변수

  it('단일 메시지를 가져올 수 있어야 함', async () => {
    const res = await request(app).get('/api/message/2KlliIGo9rRPF9TITBOh');

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.treeId, '4ff85ae1cd6e476cb47addce5479c689');
    assert.strictEqual(res.body.message, 'sadsd');
  });

  it('메시지를 작성할 수 있어야 함', async () => {
    const res = await request(app)
      .post('/api/message/4ff85ae1cd6e476cb47addce5479c689/write')
      .set(
        'Cookie',
        'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJrYWthbzozNDE3NzE1MzI2IiwiaWF0IjoxNzEyNzk3OTk1fQ.v7uIgEYNNG2JhSzLY3_2XkqQBlkbvjxQO06zjec3VXk'
      )
      .send({
        message: 'Hello',
        icon: 'https://storage.googleapis.com/eliceii.appspot.com/icons/free-icon-angry-face-11052399.png?GoogleAccessId=firebase-adminsdk-uay5h%40eliceii.iam.gserviceaccount.com&Expires=1742169600&Signature=g%2F0EI36kIf8%2BRV5mlM9pY72Gz87OzxHl%2FoOEuTR4HkL1lzVWpYH6BVPMSenxgO9VsinmLWDCkS1rleXYXi%2BzAB%2B8UunGl%2B9zrKX58hfyPwdORPrI2%2FundriVW0LwHUOdq9DF4U9Qv%2BdfdGhUl%2F6YYRjbTSa58uIMju0PL4xNdBVfweqWHDwBN1E64xKPwsSr%2FbkGaFMKf%2FFUpcza%2F%2BANnd%2FUy6S%2B%2BEK5Ma744sjVlEqvPa0fmud%2BynmX5nkJtwfQbLEGg4IusDSjTfvpx3Ui04qRi8Bkcn6kTtVTOS7fvAKNbmKzJNtIJRfXwbqYt3qlVKrvtB2voT4jSZvMDb4qyw%3D%3D',
        coordinate: { x: 0, y: 0 }
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, '메시지 작성 완료');
    messageId = res.body.messageId;
  });

  it('메시지를 삭제할 수 있어야 함', async () => {
    const res = await request(app)
      .delete(`/api/message/${messageId}/delete`)
      .set(
        'Cookie',
        'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJrYWthbzozNDE3NzE1MzI2IiwiaWF0IjoxNzEyNzk3OTk1fQ.v7uIgEYNNG2JhSzLY3_2XkqQBlkbvjxQO06zjec3VXk'
      );

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.messageData.treeId,
      '4ff85ae1cd6e476cb47addce5479c689'
    );
    assert.strictEqual(res.body.message, '메시지를 성공적으로 삭제하였습니다.');
  });

  it('모든 아이콘을 가져올 수 있어야 함', async () => {
    const res = await request(app).get('/api/message/icon/all');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.length, 12);
  });

  it('트리의 모든 메시지를 가져올 수 있어야 함', async () => {
    const res = await request(app).get(
      '/api/message/4ff85ae1cd6e476cb47addce5479c689/all?count=1'
    );

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.length, 11);
    assert.strictEqual(res.body[0].treeId, '4ff85ae1cd6e476cb47addce5479c689');
  });
});
