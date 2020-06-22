import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const URL_API = "https://api.the-odds-api.com";
const API_KEY = "/?apiKey=0b828ef7dcd437bd5d0c2c53892bb40a";

@Injectable({
  providedIn: 'root'
})
export class SportServiceService {
  constructor(private http: HttpClient) {}

  getAllSports(): Observable<any> {
    return this.http.get(URL_API + '/v3/sports' + API_KEY);
  }

  getPeople(): Observable<any> {
    return this.http.get('http://localhost:4200/people');
  }
}
