import RatingRepository from "@/data/repositories/rating-repository";
import { FirebaeDatabase } from "@/infra/database/firebase-database";
import config from "@/main/config";



const database = new FirebaeDatabase(config.FIREBASE_CONFIG);

export const ratingRepository = new RatingRepository(database);