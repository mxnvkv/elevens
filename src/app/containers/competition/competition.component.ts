import { Component, OnInit, Renderer2, ElementRef, ContentChildren, ContentChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Match } from 'src/app/models/match';
import { Router } from '@angular/router';
import { SportServiceService } from 'src/app/services/sport.service';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss']
})
export class CompetitionComponent implements OnInit {
  league: Match[];
  scheduledMatches: Match[][] = [];
  leagueKeyName: string;
  currentTimeInMLS: Number;
  allLiveMatches: Match[];

  constructor(
    private router: Router,
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

        this.groupMatchesByDays(data);
      });    
  }

  groupMatchesByDays(data: Match[]) {
    let matchesByDays = [];

    // getting unique days without hours, minutes etc.
    let days = [
      ...new Set(
        data.map((match: Match) => 
        new Date(match.start_time).setHours(0,0,0,0))
      )
    ];
    
    // grouping matches by days
    days.forEach((time: number) => {
      this.scheduledMatches.push(data.filter((match: Match) => 
        new Date(match.start_time).setHours(0,0,0,0) === time));
    })
  }
}
