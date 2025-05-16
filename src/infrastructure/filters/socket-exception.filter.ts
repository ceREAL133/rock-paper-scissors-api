import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ValidationError } from 'class-validator';
import { Socket } from 'socket.io-client';

@Catch(WsException)
export class SocketExceptionsFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();

    const error = exception.getError();

    client.emit('validation_error', {
      message: Array.isArray(error)
        ? (error as ValidationError[])
            .map((e) => {
              const constraints = e.constraints ?? {};
              return Object.values(constraints).join(', ');
            })
            .join('; ')
        : error,
    });
  }
}
