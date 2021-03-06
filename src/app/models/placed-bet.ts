import { Match } from './match';

export interface PlacedBet {
    runnerDetails: string,
    odds: number,
    stake: number,
    placedTime: number,
    match: Match,
    betNumber?: number,
    id: string
}
