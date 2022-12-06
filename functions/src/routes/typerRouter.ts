import express from "express";
import { ObjectId } from "mongodb";
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

//put method
//update user/ info
typerRouter.put("/:id", async (req, res) => {
  // what to update
  const id: string = req.params.id;
  // how to update
  const updatedUser: User = req.body;
  delete updatedUser._id;
  try {
    const client = await getClient();
    // v1: (updateOne)
    const result = await client
      .db()
      .collection<User>("celestialTyper")
      .updateOne({ _id: new ObjectId(id) }, { $inc: { upvotes: 1 } });
    // ------------------------
    // v2: preferred (replaceOne)
    // const result = await client
    //   .db()
    //   .collection<Shoutout>("shoutouts")
    //   .replaceOne({ _id: new ObjectId(id) }, updatedUser);
    if (result.modifiedCount) {
      // something was modified
      // updatedUser.upvotes++; (used for version 1 - with updateOne)
      // only for v2 - add back in _id:
      updatedUser._id = new ObjectId(id);
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

//delete method - delete a user
typerRouter.delete("/:id", async (req, res) => {
  const idToDelete: string = req.params.id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<User>("celestialTyper")
      .deleteOne({ _id: new ObjectId(idToDelete) });
    if (result.deletedCount > 0) {
      // something was deleted
      res.sendStatus(204);
    } else {
      // didn't delete anything (not found)
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

export default typerRouter;
