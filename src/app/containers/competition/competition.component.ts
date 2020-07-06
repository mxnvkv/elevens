import { Component, OnInit } from '@angular/core';
import { Match } from 'src/app/models/match';
import { Router } from '@angular/router';
import { SportServiceService } from 'src/app/services/sport.service';
import { HttpClient } from '@angular/common/http';
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

  constructor(
    private router: Router,
    private http: HttpClient,
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
      });
  }
}
