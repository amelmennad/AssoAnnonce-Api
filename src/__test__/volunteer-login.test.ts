import { afterAll, beforeAll, expect, describe, test } from "@jest/globals";

const supertest = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const appTest = require("../app");

let mongoServer;

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
