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
  score: number = 0;
  currentMatchId?: string;
  move?: Move;
}
