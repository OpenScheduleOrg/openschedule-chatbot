import { Database } from "../database/database";
import { Repository } from "@/domain/repositories/repository";

import { User } from "@/domain/repositories/models";
import { UserFields } from "@/domain/repositories/fields";

export default class UserRepository implements Repository<User, UserFields> {

    private readonly collection = "users";
    constructor(private readonly database: Database){}

    async insert(data: User): Promise<void> {
        await this.database.insert(this.collection, data);
    }
    async update(data: User): Promise<void> {
        await this.database.update(this.collection, data);
    }
    async load(): Promise<User[]> {
        return await this.database.load(this.collection);
    }
    async find(query: UserFields): Promise<User[]> {
        return await this.database.find(this.collection, query);
    }
    async findById(id: string): Promise<User> {
        return await this.database.findById(this.collection, id)
    }

} 