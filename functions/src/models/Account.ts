import { ObjectId } from "mongodb";
import Article from "./Article";
import Score from "./Score";

export default interface Account {
  _id?: ObjectId;
  profilePic: string;
  userName: string;
  scores: Score[];
  favoritedArticles: Article[];
  uid: string;
  initialSetUp: boolean;
}
