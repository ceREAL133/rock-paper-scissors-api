import { Injectable, NotFoundException } from '@nestjs/common';

import { Player } from '../../domain/models/player';
import { Match } from '../../domain/models/match';
import { InMemoryMatchRepository } from '../../infrastructure/repositories/in-memory-match.repository';
import { InMemoryPlayerRepository } from '../../infrastructure/repositories/in-memory-player.repository';

@Injectable()
export class PlayerContextService {
  constructor(
    private readonly playerRepo: InMemoryPlayerRepository,
    private readonly matchRepo: InMemoryMatchRepository,
  ) {}

  getPlayerById(socketId: string): Player {
    const player = this.playerRepo.findById(socketId);
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  addPlayer(player: Player) {
    return this.playerRepo.add(player);
  }

  removePlayerById(playerId: string) {
    return this.playerRepo.remove(playerId);
  }

  getMatchById(matchId: string): Match {
    const match = this.matchRepo.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  removeMatchById(matchId: string) {
    return this.matchRepo.remove(matchId);
  }

  addMatch(match: Match) {
    return this.matchRepo.add(match);
  }
}
