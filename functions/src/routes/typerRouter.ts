import express from "express";
import { getClient } from "../db";
import User from "../models/User";

const typerRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

typerRouter.get("/", async (req, res) => {
  try {
    const client = await getClient();
    const cursor = client.db().collection<User>("celestialTyper").find();
    const results = await cursor.toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});
// .post method
// creating/adding new users
typerRouter.post("/addUser", async (req, res) => {
  const newUser: User = req.body;
  try {
    const client = await getClient();
    await client.db().collection<User>("celestialTyper").insertOne(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    errorResponse(err, res);
  }
});

export default typerRouter;
