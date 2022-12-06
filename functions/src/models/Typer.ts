import { ObjectId } from "mongodb";
import Article from "./Article";
import Score from "./Score";

export default interface Typer {
  _id?: ObjectId;
  profilePic: string;
  userName: string;
  scores: Score[];
  favoritedArticles: Article[];
}
