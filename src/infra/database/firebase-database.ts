import { Database } from "@/data/database/database";
import { initializeApp, FirebaseOptions } from "@firebase/app";
import { Firestore, getFirestore, collection, getDocs, setDoc, addDoc } from "@firebase/firestore";

export class FirebaeDatabase implements Database {

  private readonly firestore: Firestore;
  constructor(config: FirebaseOptions) {
    const app = initializeApp(config);
    this.firestore = getFirestore(app);
  }

  async insert(collection_name: string, data: any): Promise<void> {
      const col = collection(this.firestore, collection_name);
      addDoc(col, data);
  }

  update(collection_name: string, data: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  load(collection_name: string): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  find(collection_name: string, query: any): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  findById(collection_name: string, id: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}