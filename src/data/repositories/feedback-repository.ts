import { Database } from "../database/database";
import { Repository } from "@/domain/repositories/repository";

import { Feedback } from "@/domain/repositories/models";
import { FeedbackFields } from "@/domain/repositories/fields";

export default class FeedbackRepository implements Repository<Feedback, FeedbackFields> {

    private readonly collection = "feedbacks";
    constructor(private readonly database: Database){}

    async insert(data: Feedback): Promise<void> {
        data.timestamp = data.timestamp || new Date();
        data.readed = data.readed || false;

        await this.database.insert(this.collection, data);
    }
    async update(data: Feedback): Promise<void> {
        await this.database.update(this.collection, data);
    }
    async load(): Promise<Feedback[]> {
        return await this.database.load(this.collection);
    }
    async find(query: FeedbackFields): Promise<Feedback[]> {
        return await this.database.find(this.collection, query);
    }
    async findById(id: string): Promise<Feedback> {
        return await this.database.findById(this.collection, id)
    }

} 