import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const URL_API = "https://api.the-odds-api.com";
const API_KEY = "0b828ef7dcd437bd5d0c2c53892bb40a";

@Injectable({
  providedIn: 'root'
})
export class SportServiceService {
  constructor(private http: HttpClient) {}

  getLeague(leagueName: string): Observable<any> {
    return this.http.get('http://localhost:4200/' + leagueName);
  }

  getAllLeagueNames() {
    return [
      'soccer-epl',
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

  postData(data: any): Observable<any> {
    return this.http.post('http://localhost:4200/soccer_spain_la_liga', data);
  }
}
