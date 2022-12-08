import express from "express";
import { ObjectId } from "mongodb";
import { getClient } from "../db";
import Account from "../models/Account";

const typerRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

typerRouter.get("/", async (req, res) => {
  try {
    const client = await getClient();
    const cursor = client
      .db()
      .collection<Account>("celestialTyper")
      .aggregate([
        { $unwind: "$scores" },
        { $sort: { "scores.adjustedCharactersPerMinute": 1 } },
        { $group: { _id: "$_id", scores: { $push: "$scores" } } },
      ]);
    const results = await cursor.toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

typerRouter.get("/:uid", async (req, res) => {
  const uid: string = req.params.uid;
  try {
    const client = await getClient();
    const cursor = client
      .db()
      .collection<Account>("celestialTyper")
      .findOne({ uid: uid });
    const results = await cursor;
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

// .post method
// creating/adding new Accounts
typerRouter.post("/addAccount", async (req, res) => {
  const newAccount: Account = req.body;
  try {
    const client = await getClient();
    await client
      .db()
      .collection<Account>("celestialTyper")
      .insertOne(newAccount);
    res.status(201).json(newAccount);
  } catch (err) {
    errorResponse(err, res);
  }
});

//put method
//update Account/ info
typerRouter.put("/:id", async (req, res) => {
  // what to update
  const id: string = req.params.id;
  // how to update
  const updatedAccount: Account = req.body;
  delete updatedAccount._id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Account>("celestialTyper")
      .replaceOne({ _id: new ObjectId(id) }, updatedAccount);
    if (result.modifiedCount) {
      updatedAccount._id = new ObjectId(id);
      res.status(200).json(updatedAccount);
    } else {
      res.status(404).json({ message: "Account not found" });
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
      .collection<Account>("celestialTyper")
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
