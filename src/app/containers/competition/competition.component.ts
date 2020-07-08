import { Component, OnInit, Renderer2, ElementRef, ContentChildren, ContentChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Match } from 'src/app/models/match';
import { Router } from '@angular/router';
import { SportServiceService } from 'src/app/services/sport.service';
import { concat, observable } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
// import { AccountSettings } from 'src/app/models/account-settings';
// import { concat } from 'rxjs';
// import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss']
})
export class CompetitionComponent implements OnInit {
  league: Match[];
  scheduledMatches: Match[];
  leagueKeyName: string;
  currentTimeInMLS: Number;
  allLiveMatches: Match[];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private sportService: SportServiceService,
  ) {
    this.leagueKeyName = this.router.url.split('/').pop();
  }

  ngOnInit(): void {
    this.sportService.getLeague(`${this.leagueKeyName}`)
      .subscribe((data: Match[]) => {
        data.sort((a, b) => a.start_time - b.start_time);
        this.league = data;
      });

    this.sportService.getLeague(`${this.leagueKeyName}_schedule`)
      .subscribe((data: Match[]) => {
        data.sort((a, b) => a.start_time - b.start_time);
        this.scheduledMatches = data;

        this.getLiveMatches()
      });    
  }

  getLiveMatches() {
    this.sportService.getAllLiveFootballMatches()
      .subscribe((data: Match[]) => {
        this.allLiveMatches = data;  
        
        this.scheduledMatches.forEach((match: Match) => {
          data.forEach((liveMatch: Match) => {
            if (liveMatch.id === match.id) {
              match.isMatchLive = true;
            }
          })
        })
      })
  }
}
