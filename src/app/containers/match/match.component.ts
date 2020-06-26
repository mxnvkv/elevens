import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SportServiceService } from 'src/app/services/sport.service';
import { Match } from 'src/app/models/match';
import { OddsDetails } from 'src/app/models/odds-details';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {

  match: Match;
  matchOdds: OddsDetails[] = [];
  matchID: string;
  leagueName: string

  constructor(
    private router: Router,
    private sportService: SportServiceService
  ) { 
    this.matchID = router.url.split('/').pop();
    this.leagueName = router.url.split('/')[2];
  }

  ngOnInit(): void {
    this.sportService.getMatch(this.leagueName, this.matchID)
      .subscribe((data: Match) => {
        this.match = data;

        this.matchOdds = [
          { runnerDetails: data.teams[0], odds: data.site.odds.h2h[0] },
          { runnerDetails: data.teams[1], odds: data.site.odds.h2h[1] },
          { runnerDetails: 'The Draw', odds: data.site.odds.h2h[2] },
        ]
      });
  }
}