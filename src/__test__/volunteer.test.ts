import { afterAll, beforeAll, expect, describe, test } from "@jest/globals";

const supertest = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const appTest = require("../app");

let mongoServer;
describe("volunteer register", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("check serveur", async () => {
    const response = await supertest(appTest).get("/");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual("Hello World");
  });

  test("add volunteer", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email@test.com",
      password: "Password2!",
      token: "uid2(16)",
      cgu: true,
      birthday: "2001-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("id");
  });

  test("error = not all need data", async () => {
    const volunteer = {
      lastName: "lastName",
      email: "email2@test.com",
      password: "Password2!",
      token: "uid2(16)",
      cgu: true,
      birthday: "2001-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain("not all need data");
  });

  test("error = age: too young", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email3@test.com",
      password: "Password2!",
      token: "uid2(16)",
      cgu: true,
      birthday: "2010-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain("age: too young");
  });

  test("error = password: too short", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email4@test.com",
      password: "Pass2!",
      token: "uid2(16)",
      cgu: true,
      birthday: "2001-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain("password: too short");
  });

  test("error = password: not validated", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email5@test.com",
      password: "Password2",
      token: "uid2(16)",
      cgu: true,
      birthday: "2001-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain("password: not validated");
  });

  test("error = email: not validated not @", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "emailtest.com",
      password: "Password2!",
      token: "uid2(16)",
      cgu: true,
      birthday: "2001-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain("email: not validated");
  });

  test("error = email: not validated not .xx", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email@test",
      password: "Password2!",
      token: "uid2(16)",
      cgu: true,
      birthday: "2001-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain("email: not validated");
  });

  test("error = email: not validated not .xx", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email@test.com",
      password: "Password2!",
      token: "uid2(16)",
      cgu: true,
      birthday: "2001-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain("email exist");
  });
});

/* LOGIN */
describe("volunteer login", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("check serveur", async () => {
    const response = await supertest(appTest).get("/");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual("Hello World");
  });

  test("add volunteer", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email@test.com",
      password: "Password2!",
      token: "uid2(16)",
      cgu: true,
      birthday: "2001-06-01",
      timestamps: {
        createdAt: Date.now(),
      },
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/register")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("id");
  });

  test("login volunteer", async () => {
    const volunteer = {
      email: "email@test.com",
      password: "Password2!",
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/login")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("id");
  });

  test("login volunteer : unauthorized - mail not exist", async () => {
    const volunteer = {
      email: "emai@test.com",
      password: "Password2!",
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/login")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(401);
    expect(response.text).toContain("mail not exist");
  });

  test("login volunteer : unauthorized - password not match", async () => {
    const volunteer = {
      email: "email@test.com",
      password: "Password1!",
    };

    const response = await supertest(appTest)
      .post("/api/volunteer/login")
      .send(volunteer)
      .set("Accept", "application/json");
    expect(response.statusCode).toEqual(401);
    expect(response.text).toContain("password not match");
  });
});

