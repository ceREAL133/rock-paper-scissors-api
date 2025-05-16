import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters } from '@nestjs/common';

import { MoveService } from '../../application/use-cases/move.service';
import { MatchmakingService } from '../../application/use-cases/matchmaking.service';
import { CreatePlayerDto } from '../../application/dto/create-player.dto';
import { MakeMoveDto } from '../../application/dto/make-move.dto';
import { SocketValidationPipe } from '../../infrastructure/pipes/socket-validation.pipe';
import { SocketExceptionsFilter } from '../../infrastructure/filters/socket-exception.filter';
import { PlayerContextService } from 'src/application/use-cases/player-context.service';

@UseFilters(new SocketExceptionsFilter())
@WebSocketGateway({ cors: true })
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly matchmakingService: MatchmakingService,
    private readonly moveService: MoveService,
    private readonly context: PlayerContextService,
  ) {}

  afterInit(server: Server) {
    this.matchmakingService.setServer(server);
    this.moveService.setServer(server);

    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    this.matchmakingService.removePlayer(client.id);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() createPlayerDto: CreatePlayerDto,
  ) {
    this.matchmakingService.addPlayer(client.id, createPlayerDto);
  }

  @SubscribeMessage('player_status')
  handlePlayerStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() statusData: string,
  ) {
    this.logger.log(
      `Player status from ${client.id}: ${JSON.stringify(statusData)}`,
    );
  }

  @SubscribeMessage('make_move')
  handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody(new SocketValidationPipe()) moveData: MakeMoveDto,
  ) {
    this.logger.log(`Received move from ${client.id}: ${moveData.move}`);

    this.moveService.submitMove(client.id, moveData.move);
  }

  @SubscribeMessage('get_score')
  handleGetScore(@ConnectedSocket() client: Socket) {
    const player = this.context.getPlayerById(client.id);
    if (!player) return;

    this.logger.log(`Player ${player.username} requested score`);

    this.matchmakingService.getServer().to(client.id).emit('score_result', {
      score: player.score,
    });
  }

  @SubscribeMessage('rematch')
  handleRematch(@ConnectedSocket() client: Socket) {
    this.logger.log(`Player ${client.id} requested rematch`);

    this.matchmakingService.requestRematch(client.id);
  }
}
