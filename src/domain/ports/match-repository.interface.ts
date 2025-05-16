import { Match } from '../models/match';

export interface MatchRepository {
  add(match: Match): void;
  findById(id: string): Match | undefined;
  remove(id: string): void;
}
