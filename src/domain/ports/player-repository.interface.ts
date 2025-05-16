import { Player } from '../models/player';

export interface PlayerRepository {
  add(player: Player): void;
  findById(id: string): Player | undefined;
  remove(id: string): void;
}
