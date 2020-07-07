import { Component, OnInit, Renderer2, ViewChildren, ElementRef } from '@angular/core';
import { SportServiceService } from 'src/app/services/sport.service';
import { Match } from 'src/app/models/match';
import { AccountSettings } from 'src/app/models/account-settings';
import { concat } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-football',
  templateUrl: './football.component.html',
  styleUrls: ['./football.component.scss']
})
export class FootballComponent implements OnInit {
  
  allLeagueNames: string[] = [];
  allLeaguesData: Match[][] = [];
  allScheduledMatches: Match[][] = [];
  allLiveMatches: Match[];
  showAllLiveMatches: boolean = false;
  accountSettings: AccountSettings;
  currentTime: Date;

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
    private sportService: SportServiceService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.allLeagueNames = this.sportService.getAllLeagueNames();
    
    this.allLeagueNames.forEach((leagueName) => {
      this.sportService.getLeague(leagueName)
        .subscribe((data: Match[]) => {
          this.allLeaguesData.push(data);

          this.allLeaguesData.length >= 4 ? this.sortLeagues() : '';
        })
    });
    
    this.allLeagueNames.forEach((leagueName) => {
      this.sportService.getLeague(`${leagueName}_schedule`)
        .subscribe((data: Match[]) => {
          this.allScheduledMatches.push(data);
        })
    });

    this.sportService.getAccountSettings()
      .subscribe((data: AccountSettings) => {
        this.accountSettings = data;
      });

    this.sportService.getAllLiveFootballMatches()
      .subscribe((data: Match[]) => {
        this.allLiveMatches = data;
      });

    this.sportService.getClock()
      .subscribe((data: Date) => {
        this.currentTime = data;

        if (data.getTime() > this.accountSettings?.soccer_schedule_time) {
          console.log('Time!');
          this.createSchedule();
        }

        /* 
          Add match to 'live' section,
          if it started
        */

        if (data.getSeconds() === 0) {
          this.checkForLiveMatches(data);
        }
      });
  }

  returnLeagueDisplayTitle(leagueKey) {
    return this.leagueDisplayTitles[this.leagueKeys.indexOf(leagueKey)];
  }

  sortLeagues() {
    this.allLeaguesData.sort((a, b) => {
      return a[0].sport_key.localeCompare(b[0].sport_key);
    })
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
    console.log(`Schedule creation for all 4 leagues has started`);
    console.log(this.accountSettings);

    let leagues = [ ...this.allLeaguesData ];
    let observables = [];

    leagues.forEach((league: Match[]) => {
      league.forEach((match: Match) => {
        let dayInMiliseconds = 24 * 60 * 60 * 1000;
        let tomorrowDate = this.getDayInMiliseconds(new Date().getTime()) + dayInMiliseconds; 
        let matchStartTime = this.getDayTime(match.start_time);
        let matchNewStartTime = tomorrowDate + matchStartTime;

        match.start_time = matchNewStartTime;
        match.id = uuidv4();

        observables.push(this.sportService.addMatchToSchedule(match))
      })
    })

    this.accountSettings.soccer_schedule_time += 24 * 60 * 60 * 1000;
    let updateAccount = this.sportService.updateAccountSettings(this.accountSettings);

    concat(...observables, updateAccount).subscribe(console.log);
  }

  checkForLiveMatches(date: Date) {
    console.log('Checking for live matches');

    let allMatches = [].concat( ...this.allScheduledMatches );
    let allLiveMatches = [ ...this.allLiveMatches ];
    let observables = [];

    /* 
      If match is already live, exclude it
      from allMatches, so we won't check it
    */

    for (let i = 0; i < allLiveMatches.length; i++) {
      for (let j = 0; j < allMatches.length; j++) {

        if (allLiveMatches[i].id === allMatches[j].id) {
          allMatches.splice(allMatches.indexOf(allLiveMatches[i]));
          j--;
        }

      }
    }

    allMatches.forEach((match: Match) => {
      if (date.getTime() > match.start_time) {
        observables.push(this.sportService.addMatchToLive(match))
      }
    })

    concat(...observables).subscribe((match: Match) => this.allLiveMatches.push(match));
  }

  showOtherLiveMatches() {
    this.showAllLiveMatches = true;

    // hiding "see-more" element
    const parent = document.querySelector('.in-play');
    const child = document.querySelector('.see-more-button');

    this.renderer.removeChild(parent, child);
  }

  hideElement(index: number) {
    return index >= 5;
  }
}
