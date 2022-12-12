import express from "express";
import { ObjectId } from "mongodb";
import { getClient } from "../db";
import Account from "../models/Account";

const typerRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

//* GET method to retrieve user data from MongoDB database
typerRouter.get("/", async (req, res) => {
  try {
    const client = await getClient();
    const cursor = client
      .db()
      .collection<Account>("celestialTyper")
      .aggregate([
        //* sorts data by adjustedCharactersPerMinute
        { $unwind: "$scores" },
        { $sort: { "scores.adjustedCharactersPerMinute": 1 } },
        //*groups sorted data by id, pushes scores to new array.
        {
          $group: {
            _id: "$_id",
            scores: { $push: "$scores" },
          },
        },
      ]);
    const results = await cursor.toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

//* GET method to retrieve data from MongoDB database through the '/:uid' path
typerRouter.get("/:uid", async (req, res) => {
  const uid: string = req.params.uid;
  try {
    const client = await getClient();
    const cursor = client
      .db()
      .collection<Account>("celestialTyper")
      //* query to search database for a specific account
      .findOne({ uid: uid });
    const results = await cursor;
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

//* POST method to create a new account in our MongoDB database. Accessed though '/addAccount' path
typerRouter.post("/addAccount", async (req, res) => {
  const newAccount: Account = req.body;
  try {
    const client = await getClient();
    await client
      .db()
      .collection<Account>("celestialTyper")
      //* .insertOne method to add new account
      .insertOne(newAccount);
    res.status(201).json(newAccount);
  } catch (err) {
    errorResponse(err, res);
  }
});

//* PUT method to update an existing account in our MongoDB database. Accessed through '/:id' path
typerRouter.put("/:id", async (req, res) => {
  //* what to update
  const id: string = req.params.id;
  //* how to update
  const updatedAccount: Account = req.body;
  delete updatedAccount._id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Account>("celestialTyper")
      //* replaceOne method to update account with data included in the request body
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

//* DELETE method used to detlet an account from our MongoDB database. Accessed through '/:id' path
typerRouter.delete("/:id", async (req, res) => {
  const idToDelete: string = req.params.id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Account>("celestialTyper")
      //* if the account is found, 'deleteOne()' method is used to delete the account.
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

// only used in PostMan to see all users
typerRouter.get("/all", async (req, res) => {
  try {
    const client = await getClient();
    const cursor = client.db().collection<Account>("celestialTyper").find();
    const results = await cursor.toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

// only used in PostMan to add multiple accounts at once
typerRouter.post("/addAccounts", async (req, res) => {
  const newAccounts: Account[] = req.body;
  try {
    const client = await getClient();
    await client
      .db()
      .collection<Account>("celestialTyper")
      .insertMany(newAccounts);
    res.status(201).json(newAccounts);
  } catch (err) {
    errorResponse(err, res);
  }
});

export default typerRouter;
