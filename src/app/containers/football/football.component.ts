import { Component, OnInit } from '@angular/core';
import { SportServiceService } from 'src/app/services/sport.service';
import { Match } from 'src/app/models/match';

@Component({
  selector: 'app-football',
  templateUrl: './football.component.html',
  styleUrls: ['./football.component.scss']
})
export class FootballComponent implements OnInit {
  
  allLeagueNames: string[] = [];
  allLeaguesData: Match[][] = [];

  leagueKeys = [
    'soccer_epl',
    'soccer_germany_bundesliga', 
    'soccer_italy_serie_a', 
    'soccer_spain_la_liga',
  ];

  leagueDisplayTitles = [
    'English Football', 
    'German Football',
    'Italian Football',
    'Spanish Football'
  ];

  constructor(
    private sportService: SportServiceService
  ) { }

  ngOnInit(): void {
    this.allLeagueNames = this.sportService.getAllLeagueNames();
    
    this.allLeagueNames.forEach((leagueName) => {
      this.sportService.getLeague(leagueName)
        .subscribe((data: Match[]) => {
          this.allLeaguesData.push(data);
        })
    })
  }

  returnLeagueDisplayTitle(leagueKey) {
    return this.leagueDisplayTitles[this.leagueKeys.indexOf(leagueKey)];
  }
}
