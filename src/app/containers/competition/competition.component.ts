import { Component, OnInit } from '@angular/core';
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
  leagueKeyName: string;

  constructor(
    private router: Router,
    private sportService: SportServiceService
  ) {
    this.leagueKeyName = this.router.url.split('/').pop();
  }

  ngOnInit(): void {
    this.sportService.getLeague(this.leagueKeyName)
      .subscribe((data) => console.log(data))
  }

}
