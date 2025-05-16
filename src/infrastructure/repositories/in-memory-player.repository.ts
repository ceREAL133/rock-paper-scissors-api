import { Injectable } from '@nestjs/common';
import { Player } from '../../domain/models/player';
import { PlayerRepository } from '../../domain/ports/player-repository.interface';

@Injectable()
export class InMemoryPlayerRepository implements PlayerRepository {
  private readonly players = new Map<string, Player>();

  add(player: Player): void {
    this.players.set(player.id, player);
  }

  findById(id: string): Player | undefined {
    return this.players.get(id);
  }

  remove(id: string): void {
    this.players.delete(id);
  }
}
