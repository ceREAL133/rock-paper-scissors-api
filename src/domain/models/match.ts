import { v4 as uuidv4 } from 'uuid';

export class Match {
  public readonly id: string;

  constructor(public readonly playerIds: [string, string]) {
    this.id = uuidv4();
  }
}
