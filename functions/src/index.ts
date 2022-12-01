import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import typer from "./routes/typerRouter";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/typer", typer);
export const api = functions.https.onRequest(app);
