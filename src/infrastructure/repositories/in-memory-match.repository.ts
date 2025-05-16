import { Injectable } from '@nestjs/common';
import { Match } from '../../domain/models/match';
import { MatchRepository } from '../../domain/ports/match-repository.interface';

@Injectable()
export class InMemoryMatchRepository implements MatchRepository {
  private readonly matches = new Map<string, Match>();

  add(match: Match): void {
    this.matches.set(match.id, match);
  }

  findById(id: string): Match | undefined {
    return this.matches.get(id);
  }

  remove(id: string): void {
    this.matches.delete(id);
  }
}
