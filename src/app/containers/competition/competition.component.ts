import { Component, OnInit } from '@angular/core';
import { Match } from 'src/app/models/match';
import { Router } from '@angular/router';
import { SportServiceService } from 'src/app/services/sport.service';
import { HttpClient } from '@angular/common/http';
import { AccountSettings } from 'src/app/models/account-settings';
import { concat } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss']
})
export class CompetitionComponent implements OnInit {
  league: Match[];
  scheduledMatches: Match[];
  leagueKeyName: string;
  accountSettings: AccountSettings;

  currentTime: Date;
  currentTimeInMLS: Number;
  editedTime: number = this.getDayInMiliseconds(new Date().getTime());
  time: number = this.getDayTime(new Date().getTime());

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

    this.sportService.getAccountSettings()
      .subscribe((data: AccountSettings) => {
        this.accountSettings = data;
      });

    this.sportService.getClock()
      .subscribe((data: Date) => {
        this.currentTime = data;

        if (data.getTime() > this.accountSettings.soccer_epl_schedule_time) {
          this.createSchedule();
        }
      });
  }

  getDayTime(date: number) {
    let dayInMiliseconds = this.getDayInMiliseconds(date);

    return date - dayInMiliseconds;
  }

  getDayInMiliseconds(date: number) {
    const hours = new Date(date).getHours() * 60;
    const minutes = (new Date(date).getMinutes() + hours) * 60;
    const seconds = (new Date(date).getSeconds() + minutes) * 1000;
    const miliseconds = new Date(date).getMilliseconds() + seconds;

    date -= miliseconds;

    return date;
  }

  createSchedule() {
    console.log(`Schedule creation for ${this.leagueKeyName} has started`);
    console.log(this.accountSettings);

    let league = [ ...this.league ];

    let observables = league.map((match: Match) => {
      let tomorrowDate = this.getDayInMiliseconds(new Date().getTime()) + 24 * 60 * 60 * 1000; 
      let matchStartTime = this.getDayTime(match.start_time);
      let matchNewStartTime = tomorrowDate + matchStartTime;

      match.start_time = matchNewStartTime;
      match.id = uuidv4();

      return this.sportService.addMatchToSchedule(match);
    })

    this.accountSettings.soccer_epl_schedule_time += 24 * 60 * 60 * 1000;
    let updateAccount = this.sportService.updateAccountSettings(this.accountSettings);

    concat(...observables, updateAccount).subscribe(() => console.log('subscribed!'));
    console.log(`End of schedule creation for ${this.leagueKeyName}`);
  }
}
