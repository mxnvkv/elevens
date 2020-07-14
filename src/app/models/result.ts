export interface Result {
    homeTeamScore: number,
    awayTeamScore: number,
    matchResult: string,
    scoreChanges?: ScoreChanges[]
}

interface ScoreChanges {
    score: number[],
    minute: number
}
