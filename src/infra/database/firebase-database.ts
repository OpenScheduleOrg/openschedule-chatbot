import { Database } from "@/data/database/database";
import { initializeApp, FirebaseOptions } from "@firebase/app";
import { Firestore, getFirestore, collection, setDoc, updateDoc, doc, getDoc, Timestamp } from "@firebase/firestore";

export class FirebaeDatabase implements Database {

  private readonly firestore: Firestore;
  constructor(config: FirebaseOptions) {
    const app = initializeApp(config);
    this.firestore = getFirestore(app);
  }

  async insert(collection_name: string, data: any): Promise<void> {
    const col = collection(this.firestore, collection_name);
    const document = data.id ? doc(col, data.id) : doc(col);
    await setDoc(document, data);
  }

  async update(collection_name: string, data: any): Promise<void> {
    const col = collection(this.firestore, collection_name);
    const document = doc(col, data.id);
    await updateDoc(document, data);
  }

  load(collection_name: string): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  find(collection_name: string, query: any): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  async findById(collection_name: string, id: string): Promise<any> {
    const col = collection(this.firestore, collection_name);
    const documentReference = doc(col, id);
    const document = await getDoc(documentReference);
    const data = document.data();

    for (var field in data) {
      if (data[field] instanceof Timestamp)
        data[field] = data[field].toDate();
    }

    return data;
  }
}