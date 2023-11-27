
export interface Repository<Model, Fields> {
    insert(data: Model): Promise<void>
    update(data: Model): Promise<void>

    load(): Promise<Model[]>
    find(query: Fields): Promise<Model[]>

    findById(collection: string, id: string): Promise<Model>
}