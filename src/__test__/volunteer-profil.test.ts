import { afterAll, beforeAll, expect, describe, test } from "@jest/globals";

const supertest = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const appTest = require("../app");

let mongoServer;

describe("volunteer profil after register", () => {
  let responseToken;
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
    responseToken = response.body.token;
    console.log("file: volunteer.test.ts -> line 330 -> responseToken", responseToken);
  });

  test("volunteer profil access", async () => {
    const response = await supertest(appTest)
      .get("/api/volunteer/profil")
      .set("Authorization", responseToken);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("lastName");
    expect(response.body).toHaveProperty("email");
  });

  test("volunteer profil not send token", async () => {
    const response = await supertest(appTest).get("/api/volunteer/profil");
    expect(response.statusCode).toEqual(401);
    expect(response.text).toContain("not send token");
  });

  test("volunteer profil not exist token", async () => {
    const response = await supertest(appTest)
      .get("/api/volunteer/profil")
      .set("Authorization", "isNotGoodToken");
    expect(response.statusCode).toEqual(401);
    expect(response.text).toContain("not exist token");
  });
});

describe("volunteer profil after login", () => {
  let responseToken = null;

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
    responseToken = response.body.token;
  });

  test("volunteer profil access after login ", async () => {
    const response = await supertest(appTest)
      .get("/api/volunteer/profil")
      .set("Authorization", responseToken);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("lastName");
    expect(response.body).toHaveProperty("email");
  });

  test("volunteer profil not send token", async () => {
    const response = await supertest(appTest).get("/api/volunteer/profil");
    expect(response.statusCode).toEqual(401);
    expect(response.text).toContain("not send token");
  });

  test("volunteer profil not exist token", async () => {
    const response = await supertest(appTest)
      .get("/api/volunteer/profil")
      .set("Authorization", "isNotGoodToken");
    expect(response.statusCode).toEqual(401);
    expect(response.text).toContain("not exist token");
  });
});
