import { Move } from '../enums/move.enum';
import { PlayerStatus } from '../enums/player-status.enum';

export class Player {
  constructor(
    public readonly id: string,
    public readonly username: string,
  ) {
    this.status = PlayerStatus.OutOfGame;
  }

  status: PlayerStatus;
  currentMatchId?: string;
  score: number = 0;
  move?: Move;
}
