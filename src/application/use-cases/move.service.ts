import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

import { Move } from '../../domain/enums/move.enum';
import { Result } from '../../domain/enums/result.enum';
import { PlayerStatus } from '../../domain/enums/player-status.enum';
import { Player } from '../../domain/models/player';
import { PlayerContextService } from './player-context.service';

type GameOutcome =
  | { result: Result.Draw }
  | { result: Result.Win; winnerId: string };

@Injectable()
export class MoveService {
  private readonly logger = new Logger(MoveService.name);
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  constructor(private readonly context: PlayerContextService) {}

  submitMove(playerId: string, move: Move) {
    const player = this.context.getPlayerById(playerId);

    if (!player) {
      this.logger.warn(`Player ${playerId} not found`);
      return;
    }

    if (!player.currentMatchId) {
      this.logger.warn(`Player ${playerId} is not in a match`);
      return;
    }

    const match = this.context.getMatchById(player.currentMatchId);
    if (!match) {
      this.logger.warn(`Match ${player.currentMatchId} not found`);
      return;
    }

    const [player1, player2] = match.playerIds.map((id) =>
      this.context.getPlayerById(id),
    );

    if (!player1 || !player2) {
      this.logger.warn(`Players not found for match ${match.id}`);
      return;
    }

    const opponent = playerId === player1.id ? player2 : player1;

    player.move = move;
    player.status = PlayerStatus.MadeChoice;

    this.logger.log(`Player ${player.username} made move: ${move}`);
    this.server.to(opponent.id).emit('player_status', player.status);

    if (player1.move && player2.move) {
      this.logger.warn(`Both players already made a move. Move ignored.`);

      this.server.to(player.id).emit('move_rejected', {
        reason: 'Move already resolved',
      });
    } else {
      return;
    }

    const roundOutcome = this.resolveGame(player1, player2);
    this.logger.log(
      `Match ${match.id} result: ${player1.username} (${player1.move}) vs ${player2.username} (${player2.move}) → ${roundOutcome.result}`,
    );

    let outcome1: Result;
    let outcome2: Result;

    if (roundOutcome.result === Result.Draw) {
      outcome1 = outcome2 = Result.Draw;
    } else if (roundOutcome.winnerId === player1.id) {
      player1.score += 1;
      outcome1 = Result.Win;
      outcome2 = Result.Lose;
    } else {
      player2.score += 1;
      outcome1 = Result.Lose;
      outcome2 = Result.Win;
    }

    this.emitMatchResult(player1, player2, outcome1);
    this.emitMatchResult(player2, player1, outcome2);

    player1.move = undefined;
    player2.move = undefined;
  }

  private resolveGame(player1: Player, player2: Player): GameOutcome {
    if (player1.move === player2.move) return { result: Result.Draw };

    const winnerId =
      (player1.move === Move.Rock && player2.move === Move.Scissors) ||
      (player1.move === Move.Scissors && player2.move === Move.Paper) ||
      (player1.move === Move.Paper && player2.move === Move.Rock)
        ? player1.id
        : player2.id;

    return { result: Result.Win, winnerId };
  }

  private emitMatchResult(player: Player, opponent: Player, outcome: Result) {
    this.server.to(player.id).emit('match_result', {
      you: player.move,
      opponent: opponent.move,
      score: player.score,
      outcome,
    });
  }
}
