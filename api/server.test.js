const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../data/dbConfig');
const server = require('./server');
const jokes = require('./jokes/jokes-data');

test('sanity', () => {
  expect(true).toBe(true);
});

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
afterAll(async () => {
  await db.destroy();
});

describe('/api/auth router', () => {

  describe('[POST] /register', () => {


    it('adds data to db', async () => {
      const actual = await db('users');
      const expected = []
      expect(actual).toMatchObject(expected);
      await request(server)
        .post('/api/auth/register')
        .send({
           username: 'test',
          password: '1234'
        });
      const after = await db('users');
      expect(after).toMatchObject([
        {
          username: 'test'
        }
      ]);
    });



    it('responds with status 201', async () => {
      const res = await request(server)
            .post('/api/auth/register')
            .send({
              username: 'BlueJay',
              password: '1234'
            });
      expect(res.status).toBe(201);
    });

    it('responds with newly created user', async () => {
      const res = await request(server)
            .post('/api/auth/register')
            .send({
              username: 'test7',
              password: '1234'
            });
      expect(res.body).toMatchObject({
        id: 3,
        username: 'test7'
      });
    });

  });


  describe('[POST] /login', () => {

    it("doesn't effect db", async () => {
      const before = await db('users');
      await request(server)
        .post('/api/auth/login')
        .send({
          username: 'test',
          password: '1234'
        });
      const after = await db('users');
      expect(after).toMatchObject(before);
    });


    it('responds with a 400 and a message when username doesnt exist or password incorrect', async () => {
      let res = await request(server)
          .post('/api/auth/login')
          .send({
            username: 'test150',
            password: '1234'
          });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('invalid credentials');
      res = await request(server)
        .post('/api/auth/login')
        .send({
          username: 'test',
          password: '1235'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('invalid credentials');
    });

    it('returns token', async () => {
      const res = await request(server)
            .post('/api/auth/login')
            .send({
              username: 'test',
              password: '1234'
            });
      const decoded = jwt.decode(res.body.token);
      expect(decoded).toMatchObject({
        id: 1,
        username: 'test',
      });
    });

    it('responds with correct status', async () => {
      const res = await request(server)
            .post('/api/auth/login')
            .send({
              username: 'test',
              password: '1234'
            });
      expect(res.status).toBe(200);
    });

  });

});

describe('/api/jokes router', () => {

  describe('[GET] /', () => {

    it('responds with correct status when given valid token', async () => {
      const {body: {token}} = await request(server)
            .post('/api/auth/login')
            .send({
              username: 'test',
              password: '1234'
            });

      const res = await request(server)
            .get('/api/jokes')
            .set({ Authorization: token });
      expect(res.status).toBe(200);
    });

    it('dad jokes when given valid token', async () => {
      const {body: {token}} = await request(server)
            .post('/api/auth/login')
            .send({
              username: 'test',
              password: '1234'
            });

      const res = await request(server)
            .get('/api/jokes')
            .set({ Authorization: token });
      expect(res.body).toMatchObject(jokes);
    });


  });
});