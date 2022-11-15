import { Dexie } from "dexie";

export class MuralChallengeDB extends Dexie {
  safes!: Dexie.Table<ISafe, string>;
  constructor() {
    super("mural-challenge-part-2");
    this.version(1).stores({
      safes: "address",
    });
  }
}

export interface ISafe {
  address: string;
}

export const db = new MuralChallengeDB();
