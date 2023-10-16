import { AppDataStorage } from "@/infra/apps/app-data-storage";
import fs from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export class LocalAppDataStorage  implements AppDataStorage {

  async loadMap(appName: string, mapName: string)   {
    const directory = path.join(__dirname,"apps_local_storage", appName);
    const fileName = path.join(directory, mapName + ".json")

    if(!existsSync(directory))
        await fs.mkdir(directory, {recursive: true});

    let flags = "r";
    if(!existsSync(fileName))
        flags = "w+";

    const file = await fs.open(fileName, flags);
    const json = (await file.readFile()).toString() || "{}";
    await file.close()

    return JSON.parse(json);
  }

  async insertToMap(appName: string, mapName: string, key: string, value: string) {
    const directory = path.join(__dirname,"apps_local_storage", appName);
    const fileName = path.join(directory, mapName + ".json")

    const file = await fs.open(fileName, "r+");
    const map = JSON.parse((await file.readFile()).toString() || "{}");
    map[key] = value;

    await file.writeFile(JSON.stringify(map))
    await file.close();
  }
}