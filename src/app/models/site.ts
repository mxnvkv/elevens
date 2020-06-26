export interface Site {
    last_update: number,
    odds: Odds,
    site_key: string,
    site_nice: string
}

interface Odds {
    h2h: number[],
    h2h_lay: number[]
}
