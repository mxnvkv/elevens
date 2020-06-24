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
  allLeaguesData: Match[] = [];

  constructor(
    private sportService: SportServiceService
  ) { }

  ngOnInit(): void {
    this.allLeagueNames = this.sportService.getAllLeagueNames();
    
    this.allLeagueNames.forEach((leagueName) => {
      this.sportService.getLeague(leagueName)
        .subscribe((data: any) => {
          this.allLeaguesData.push(data);
        })
    })

    // this.printAllLeaguesData();
  }

  // printAllLeaguesData() {
  //   console.log(this.allLeaguesData);
  // }

}
