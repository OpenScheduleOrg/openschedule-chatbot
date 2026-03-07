import RatingRepository from "@/data/repositories/rating-repository";
import UserRepository from "@/data/repositories/user-repository";
//import { FirebaeDatabase } from "@/infra/database/firebase-database";
import { SqliteDatabase } from "@/infra/database/sqlite-database";
//import config from "@/common/config";
import FeedbackRepository from "@/data/repositories/feedback-repository";



//const database = new FirebaeDatabase(config.FIREBASE_CONFIG);
const sqliteDatabase = new SqliteDatabase();

export const ratingRepository = new RatingRepository(sqliteDatabase);
export const feedbackRepository = new FeedbackRepository(sqliteDatabase);
export const userRepository = new UserRepository(sqliteDatabase);
