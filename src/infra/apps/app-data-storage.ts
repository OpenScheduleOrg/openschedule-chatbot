
export interface AppDataStorage {
  loadMap: (appName: string, mapName: string) => Promise<{[key:string]: any}>;
  insertToMap: (appName: string, mapName: string, key: string, value: any) => Promise<void>;
}