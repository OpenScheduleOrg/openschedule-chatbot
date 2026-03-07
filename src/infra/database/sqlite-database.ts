import { Database } from "@/data/database/database";

export class SqliteDatabase implements Database {

  private readonly db: any;
  constructor() {
    this.db = {};
  }

  async insert(collection_name: string, data: any): Promise<void> {
    if (!this.db[collection_name])
      this.db[collection_name] = {}

    this.db[collection_name][data.id] = data;
  }

  async update(collection_name: string, data: any): Promise<void> {
    if (!this.db[collection_name])
      this.db[collection_name] = {}

    this.db[collection_name][data.id] = data;
  }

  load(collection_name: string): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  find(collection_name: string, query: any): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  async findById(collection_name: string, id: string): Promise<any> {
    if (!this.db[collection_name])
      this.db[collection_name] = {}

    return this.db[collection_name][id];
  }
}
