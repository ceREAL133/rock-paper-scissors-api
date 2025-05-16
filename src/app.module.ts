import { Module } from '@nestjs/common';
import { WebsocketModule } from './interfaces/websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
})
export class AppModule {}
