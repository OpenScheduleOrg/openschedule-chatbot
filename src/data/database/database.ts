
export interface Database {
    insert(collection:string, data: any): Promise<void>
    update(collection:string, data: any): Promise<void>

    load(collection:string): Promise<any[]>
    find(collection:string, query: any): Promise<any[]>

    findById(collection:string, id: string): Promise<any>
}