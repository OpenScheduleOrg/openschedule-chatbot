import { Database } from "../database/database";
import { Repository } from "@/domain/repositories/repository";

import { Rating } from "@/domain/repositories/models";
import { RatingFields } from "@/domain/repositories/fields";

export default class RatingRepository implements Repository<Rating, RatingFields> {

    private readonly collection = "ratings";
    constructor(private readonly database: Database){}

    async insert(data: Rating): Promise<void> {
        data.timestamp = data.timestamp || new Date();

        await this.database.insert(this.collection, data);
    }
    async update(data: Rating): Promise<void> {
        await this.database.update(this.collection, data);
    }
    async load(): Promise<Rating[]> {
        return await this.database.load(this.collection);
    }
    async find(query: RatingFields): Promise<Rating[]> {
        return await this.database.find(this.collection, query);
    }
    async findById(id: string): Promise<Rating> {
        return await this.database.findById(this.collection, id)
    }
} 