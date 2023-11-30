import RatingRepository from "@/data/repositories/rating-repository";
import UserRepository from "@/data/repositories/user-repository";
import { FirebaeDatabase } from "@/infra/database/firebase-database";
import config from "@/common/config";
import FeedbackRepository from "@/data/repositories/feedback-repository";



const database = new FirebaeDatabase(config.FIREBASE_CONFIG);

export const ratingRepository = new RatingRepository(database);
export const feedbackRepository = new FeedbackRepository(database);
export const userRepository = new UserRepository(database);