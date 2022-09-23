import { afterAll, beforeAll, expect, describe, test } from "@jest/globals";

const supertest = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const appTest = require("../app");

let mongoServer;
describe("volunteer", () => {
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
    expect(response.body).toMatchObject({ firstName: "firstName" });
  });

  test("error = not all need data", async () => {
    const volunteer = {
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
    expect(response.text).toContain("not all need data");
  });

  test("error = age: too young", async () => {
    const volunteer = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email@test.com",
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
      email: "email@test.com",
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
      email: "email@test.com",
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
});

