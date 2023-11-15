const request = require('supertest');
const cheerio = require('cheerio');
const bcrypt = require('bcrypt');
const db = require('../models/index');
const app = require('../app');

let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $('[name=_csrf]').val();
}

const login = async (agent, username, password) => {
  let res = await agent.get('/login');
  const csrfToken = extractCsrfToken(res);
  res = await agent.post('/session').send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe('Routes Test Suite', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test('Prevent unauthorized access', async () => {
    let res = await request(app).get('/educator')
    expect(res.status).toBe(302);
    res = await request(app).get('/student')
    expect(res.status).toBe(302);
  });

  test('POST /users should create a new user', async () => {
    let res=await agent.get("/signup")
      const csrfToken=extractCsrfToken(res)
      res=await agent.post("/users").send({
        name:"User A",
        email:"usera@test.com",
        password:"12345678",
        role:"student",
        _csrf:csrfToken,
      })
      expect(res.statusCode).toBe(302)
  });

  test('GET /signup should return HTML with CSRF token', async () => {
    const res = await agent.get('/signup');

    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(extractCsrfToken(res)).toBeTruthy();
  });

  test("Sign out",async ()=>{
      let res=await agent.get("/student")
      expect(res.statusCode).toBe(200)
      res=await agent.get("/signout")
      expect(res.statusCode).toBe(302)
      res=await agent.get("/student")
      expect(res.statusCode).toBe(302)
  })

  test("Create a new course", async () => {
    await login(agent, "teacher@example.com", "password");
    
    let res=await agent.get("/signup")
    const csrfToken = extractCsrfToken(res);
    const newCourse = {
      title: "Test Course",
      description: "Description for the test course.",
      educator_id:"1",
      _csrf: csrfToken,
    };

    res = await agent.post("/educators/courses/create").send(newCourse);
    expect(res.statusCode).toBe(302);
  });
});
