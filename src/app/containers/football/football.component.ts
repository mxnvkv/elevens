import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { SportServiceService } from 'src/app/services/sport.service';
import { Match } from 'src/app/models/match';
import { AccountSettings } from 'src/app/models/account-settings';
import { concat, Subscription, forkJoin } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { newArray } from '@angular/compiler/src/util';
import { PlacedBet } from 'src/app/models/placed-bet';
import { timestamp } from 'rxjs/operators';

@Component({
  selector: 'app-football',
  templateUrl: './football.component.html',
  styleUrls: ['./football.component.scss']
})
export class FootballComponent implements OnInit, OnDestroy {
  
  allLeagueNames: string[] = [];
  allLeaguesData: Match[][] = [];
  allScheduledMatches: Match[][] = [];
  allLiveMatches: Match[] = [];
  showAllLiveMatches: boolean = false;
  accountSettings: AccountSettings;
  currentTime: Date;
  clockSubscripion: Subscription;

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
          
          // add match to Live if it has started
          data.forEach((match: Match) => {
            if (match.isMatchLive) {
              this.allLiveMatches.push(match);
            }
          })

          // this.allScheduledMatches.length >= 4 ? this.addMatchResult() : '';
        })
    });

    this.sportService.getAccountSettings()
      .subscribe((data: AccountSettings) => {
        this.accountSettings = data;
      });

    this.clockSubscripion = this.sportService.getClock()
      .subscribe((data: Date) => {
        this.currentTime = data;

        if (data.getTime() > this.accountSettings?.soccer_schedule_time) {
          console.log('Time!');
          this.createSchedule();
        }

        /* 
          While running, add matches
          to live, if they have started
        */

        if (data.getSeconds() === 5) {
          this.checkForLiveMatches(data);
        }

        if (data.getSeconds() === 10) {
          this.deleteFinishedMatchesFromPage();
        }
      });
  }

  ngOnDestroy() {
    this.clockSubscripion.unsubscribe();
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
        match = {
          ...match,
          ...this.addMatchResult(match)
        };

        observables.push(this.sportService.addMatchToSchedule(match))
      })
    })

    this.accountSettings.soccer_schedule_time += 24 * 60 * 60 * 1000;
    let updateAccount = this.sportService.updateAccountSettings(this.accountSettings);

    concat(...observables, updateAccount).subscribe(console.log);
  }

  addMatchResult(match: Match) {
    let homeWin = parseFloat((1 / match.site.odds.h2h[0] * 100).toFixed(2));
    let awayWin = parseFloat((1 / match.site.odds.h2h[1] * 100).toFixed(2));
    let draw = parseFloat((100 - homeWin - awayWin).toFixed(2));

    let resultNumber = parseFloat((Math.random() * 100).toFixed(2));
    var result;

    var homeTeamScore;
    var awayTeamScore;

    let minutes = [ ...newArray(90) ].map((v, i) => v = i + 1);

    if (resultNumber <= homeWin) {
      result = 'W';
    } else if (resultNumber > homeWin && resultNumber <= homeWin + awayWin) {
      result = 'L';
    } else {
      result = 'D';
    }

    switch(result) {
      case 'W':
        homeTeamScore = Math.floor(Math.random() * 5) + 1;
        awayTeamScore = Math.floor(Math.random() * homeTeamScore);
        break;
      case 'L':
        awayTeamScore = Math.floor(Math.random() * 5) + 1;
        homeTeamScore = Math.floor(Math.random() * awayTeamScore);
        break;
      case 'D':
        homeTeamScore = Math.floor(Math.random() * (4 + 1));
        awayTeamScore = homeTeamScore;
        break;
    }

    minutes = minutes.sort(() => Math.random() - 0.5)
      .slice(0, homeTeamScore + awayTeamScore)
      .sort((a, b) => a - b);

    let homeMinuteScore = 0;
    let awayMinuteScore = 0;
    let scores = [];

    minutes.forEach((minute: number) => {
      let num = Math.round(Math.random());
      
      switch(num) {
        case 0:
          homeMinuteScore < homeTeamScore ? homeMinuteScore++ : awayMinuteScore++;
          scores.push([[homeMinuteScore, awayMinuteScore], minute]);
          break;

        case 1:
          awayMinuteScore < awayTeamScore ? awayMinuteScore++ : homeMinuteScore++;
          scores.push([[homeMinuteScore, awayMinuteScore], minute]);
          break;
      }
    })

    match = {
      ...match,
      result: {
        homeTeamScore: homeTeamScore,
        awayTeamScore: awayTeamScore,
        matchResult: result,
        scoreChanges: scores
      }
    }

    return match;
  }

  checkForLiveMatches(date: Date) {
    console.log('Checking for live matches');
    let observables = [];

    /* 
      Checking for all scheduled matches
      If match has started → isMatchLive = true
    */

    this.allScheduledMatches.forEach((league: Match[]) => {
      league.forEach((match: Match) => { 
        if (new Date().getTime() > match.start_time && !match.isMatchLive) {
          match.isMatchLive = true;
          observables.push(this.sportService.updateMatchInSchedule(match));
        }
      })
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

  deleteFinishedMatchesFromPage() {
    console.log('Deleting finished matches from page');

    this.allLiveMatches.forEach((match: Match, index: number) => {
      const matchMinutes = Math.floor((new Date().getTime() - match.start_time) / 1000 / 60);

      if (match.isMatchLive && matchMinutes > 90) {
        this.allLiveMatches = this.allLiveMatches.filter((m: Match) => m.id !== match.id)
      }
    })
  }
}
