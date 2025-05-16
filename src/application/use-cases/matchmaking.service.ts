import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

import { Player } from '../../domain/models/player';
import { Match } from '../../domain/models/match';
import { CreatePlayerDto } from '../dto/create-player.dto';
import { PlayerStatus } from '../../domain/enums/playerStatus.enum';
import { PlayerContextService } from './player-context.service';

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);
  private waitingQueue: Player[] = [];
  private server: Server;
  private rematchQueue = new Map<string, string>();

  setServer(server: Server) {
    this.server = server;
  }

  constructor(private readonly context: PlayerContextService) {}

  getServer(): Server {
    return this.server;
  }

  addPlayer(socketId: string, playerDto: CreatePlayerDto) {
    const player = new Player(socketId, playerDto.username);
    this.context.addPlayer(player);
    this.enqueue(player);

    this.logger.log(`Player ${playerDto.username} joined with id ${socketId}`);
  }

  removePlayer(socketId: string) {
    const player = this.context.getPlayerById(socketId);

    if (!player?.currentMatchId) return;

    const match = this.context.getMatchById(player.currentMatchId);
    if (!match) return;

    const opponentId = match.playerIds.find((id) => id !== socketId);
    if (!opponentId) return;

    const opponent = this.context.getPlayerById(opponentId);
    if (!opponent) return;

    opponent.currentMatchId = undefined;
    opponent.move = undefined;
    opponent.status = PlayerStatus.OutOfGame;
    opponent.score = 0;

    this.enqueue(opponent);

    this.server.to(opponent.id).emit('opponent_disconnected', {
      message: `${player.username} has disconnected.`,
    });

    this.logger.log(
      `Opponent ${opponent.username} returned to queue after ${player.username} disconnected.`,
    );

    this.context.removeMatchById(match.id);

    this.resetPlayerState(player);
    this.context.removePlayerById(socketId);

    this.logger.log(
      `Player ${player.username} disconnected. Score reset to 0.`,
    );
  }

  notifyStatus(player: Player) {
    if (!this.server) return;
    if (!player.currentMatchId) return;

    const match = this.context.getMatchById(player.currentMatchId);
    if (!match) return;

    const opponentId = match.playerIds.find((id) => id !== player.id);
    if (!opponentId) return;

    this.server.to(opponentId).emit('player_status', player.status);
  }

  requestRematch(playerId: string) {
    const player = this.context.getPlayerById(playerId);
    if (!player || !player.currentMatchId) return;

    const matchId = player.currentMatchId;

    if (!this.rematchQueue.has(matchId)) {
      this.rematchQueue.set(matchId, playerId);

      const match = this.context.getMatchById(matchId);
      if (!match) return;

      const otherPlayerId = match.playerIds.find((id) => id !== playerId);
      if (otherPlayerId) {
        this.server.to(otherPlayerId).emit('rematch_requested', {
          from: player.username,
        });
      }

      return;
    }

    const otherPlayerId = this.rematchQueue.get(matchId);
    if (!otherPlayerId) return;

    const otherPlayer = this.context.getPlayerById(otherPlayerId);
    if (!otherPlayer) return;

    this.resetForRematch(player);
    this.resetForRematch(otherPlayer);

    this.rematchQueue.delete(matchId);

    this.notifyMatchCreated(player, otherPlayer);
  }

  private resetForRematch(player: Player) {
    player.move = undefined;
    player.status = PlayerStatus.InGame;
  }

  private enqueue(player: Player) {
    const opponent = this.waitingQueue.shift();
    if (opponent) {
      const match = new Match([player.id, opponent.id]);
      this.context.addMatch(match);

      player.currentMatchId = match.id;
      player.status = PlayerStatus.InGame;

      opponent.currentMatchId = match.id;
      opponent.status = PlayerStatus.InGame;

      this.server.to(player.id).emit('match_created', {
        opponent: opponent.username,
      });

      this.server.to(opponent.id).emit('match_created', {
        opponent: player.username,
      });

      this.notifyStatus(player);
      this.notifyStatus(opponent);

      this.logger.log(
        `Match created: ${player.username} vs ${opponent.username}`,
      );
    } else {
      this.waitingQueue.push(player);
    }
  }

  private notifyMatchCreated(playerA: Player, playerB: Player) {
    this.server.to(playerA.id).emit('match_created', {
      opponent: playerB.username,
    });

    this.server.to(playerB.id).emit('match_created', {
      opponent: playerA.username,
    });
  }

  private resetPlayerState(player: Player) {
    player.score = 0;
    player.move = undefined;
    player.status = PlayerStatus.OutOfGame;
  }
}
