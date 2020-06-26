import { Site } from './site';

export interface Match {
    commence_time: number,
    home_team: string,
    site: Site, 
    sport_key: string,
    sport_nice: string,
    teams: string[],
    id: string
}
