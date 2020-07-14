import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match } from '../models/match';
import { AccountSettings } from '../models/account-settings';
import { PlacedBet } from '../models/placed-bet';
import { interval } from 'rxjs';
import { map, share, delay } from 'rxjs/operators';

const URL_API = "https://api.the-odds-api.com";
const API_KEY = "0b828ef7dcd437bd5d0c2c53892bb40a";

@Injectable({
  providedIn: 'root'
})
export class SportServiceService {
  private clock: Observable<Date>;

  constructor(private http: HttpClient) {
    this.clock = interval(1000).pipe(
      map(tick => new Date()),
      share()
    );
  }

  // league

  getLeague(leagueName: string): Observable<any> {
    return this.http.get(`http://localhost:4200/${leagueName}`);
  }



  // match

  getMatch(leagueName: string, matchID: string): Observable<any> {
    return this.http.get(`http://localhost:4200/${leagueName}/${matchID}`);
  }

  updateMatch(match: Match): Observable<any> {
    return this.http.put(`http://localhost:4200/${match.sport_key}/${match.id}`, match);
  }

  updateMatchInSchedule(match: Match): Observable<any> {
    return this.http.put(`http://localhost:4200/${match.sport_key}_schedule/${match.id}`, match)
      .pipe(delay(200));
  }

  addMatchToSchedule(match: Match): Observable<any> {
    return this.http.post(`http://localhost:4200/${match.sport_key}_schedule`, match)
      .pipe(delay(200));
  }

  deleteMatchFromSchedule(match: Match): Observable<any> {
    return this.http.delete(`http://localhost:4200/${match.sport_key}_schedule/${match.id}`)
      .pipe(delay(100));
  }



  // account - settings

  getAccountSettings(): Observable<any> {
    return this.http.get(`http://localhost:4200/account_settings`);
  }

  updateAccountSettings(data: AccountSettings): Observable<any> {
    return this.http.put(`http://localhost:4200/account_settings`, data);
  }



  // bets

  placeBet(bet: PlacedBet): Observable<any> {
    return this.http.post(`http://localhost:4200/bets`, bet);
  }

  getAllPlacedBets(): Observable<any> {
    return this.http.get(`http://localhost:4200/bets`);
  }

  updateBet(bet: PlacedBet): Observable<any> {
    return this.http.put(`http://localhost:4200/bets/${bet.id}`, bet)
      .pipe(delay(100));
  }



  // other

  getClock(): Observable<Date> {
    return this.clock;
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
