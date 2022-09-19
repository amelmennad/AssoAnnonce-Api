import { expect, test } from "@jest/globals";

const supertest = require("supertest");

const apptest = require("../app");

test("Home route should return hello text", async () => {
  const response = await supertest(apptest).get("/");
  expect(response.statusCode).toEqual(200);
  expect(response.body).toEqual("Hello World");
});
