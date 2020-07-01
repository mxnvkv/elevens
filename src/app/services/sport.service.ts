import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match } from '../models/match';
import { AccountSettings } from '../models/account-settings';
import { PlacedBet } from '../models/placed-bet';

const URL_API = "https://api.the-odds-api.com";
const API_KEY = "0b828ef7dcd437bd5d0c2c53892bb40a";

@Injectable({
  providedIn: 'root'
})
export class SportServiceService {
  constructor(private http: HttpClient) {}

  getLeague(leagueName: string): Observable<any> {
    return this.http.get(`http://localhost:4200/${leagueName}`);
  }

  getMatch(leagueName: string, matchID: string): Observable<any> {
    return this.http.get(`http://localhost:4200/${leagueName}/${matchID}`);
  }

  updateMatch(match: Match): Observable<any> {
    return this.http.put(`http://localhost:4200/${match.sport_key}/${match.id}`, match)
  }

  getAccountSettings(): Observable<any> {
    return this.http.get(`http://localhost:4200/account_settings`);
  }

  updateAccountSettings(data: AccountSettings): Observable<any> {
    return this.http.put(`http://localhost:4200/account_settings`, data);
  }

  placeBet(bet: PlacedBet): Observable<any> {
    return this.http.post(`http://localhost:4200/bets`, bet);
  }

  getAllPlacedBets(): Observable<any> {
    return this.http.get(`http://localhost:4200/bets`);
  }

  getAllLeagueNames() {
    return [
      'soccer_epl',
      'soccer_germany_bundesliga',
      'soccer_italy_serie_a',
      'soccer_spain_la_liga'
    ];
  }

  // #########################

  getAllSports(): Observable<any> {
    return this.http.get(URL_API + '/v3/sports/?apiKey=' + API_KEY);
  }

  getAllLeagueMatches(): Observable<any> {
    return this.http.get(`https://api.the-odds-api.com/v3/odds/?apiKey=${API_KEY}&sport=soccer_spain_la_liga&region=eu&mkt=h2h`);
  }

  getPeople(): Observable<any> {
    return this.http.get('http://localhost:4200/sports-data');
  }

  postData(league: string, data: any): Observable<any> {
    return this.http.post(`http://localhost:4200/${league}`, data);
  }
}
