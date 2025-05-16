import { Module } from '@nestjs/common';

import { WebsocketGateway } from './websocket.gateway';
import { MatchmakingService } from '../../application/use-cases/matchmaking.service';
import { MoveService } from '../../application/use-cases/move.service';
import { InMemoryPlayerRepository } from '../../infrastructure/repositories/in-memory-player.repository';
import { InMemoryMatchRepository } from '../../infrastructure/repositories/in-memory-match.repository';
import { PlayerContextService } from 'src/application/use-cases/player-context.service';

@Module({
  providers: [
    WebsocketGateway,
    InMemoryPlayerRepository,
    InMemoryMatchRepository,
    MoveService,
    MatchmakingService,
    PlayerContextService,
  ],
})
export class WebsocketModule {}
