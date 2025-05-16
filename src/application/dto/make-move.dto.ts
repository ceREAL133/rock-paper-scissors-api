import { IsEnum } from 'class-validator';
import { Move } from '../../domain/enums/move.enum';

export class MakeMoveDto {
  @IsEnum(Move, { message: 'Invalid move. Must be rock, paper, or scissors.' })
  move: Move;
}
