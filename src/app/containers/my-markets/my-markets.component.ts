import { Component, OnInit, OnDestroy } from '@angular/core';
import { SportServiceService } from 'src/app/services/sport.service';
import { PlacedBet } from 'src/app/models/placed-bet';
import { Subscription, concat } from 'rxjs';
import { AccountSettings } from 'src/app/models/account-settings';

@Component({
  selector: 'app-my-markets',
  templateUrl: './my-markets.component.html',
  styleUrls: ['./my-markets.component.scss']
})
export class MyMarketsComponent implements OnInit, OnDestroy {

  bets: PlacedBet[] = [];
  clockSubscripion: Subscription;
  currentTime: Date;
  accountSettings: AccountSettings;

  constructor(
    private sportService: SportServiceService
  ) {}

  ngOnInit(): void {
    this.sportService.getAllPlacedBets()
      .subscribe((data: PlacedBet[]) => {
        data.forEach((bet: PlacedBet, i) => {
          bet.betNumber = i + 1;
        })
        this.bets = data;
      });

    this.clockSubscripion = this.sportService.getClock()
      .subscribe(() => {
        let observables = [];

        this.bets.forEach((bet: PlacedBet) => {
          const observable = this.updateBetStatus(bet);

          if (observable) {
            observables.push(observable);
          }
        })

        concat(...observables).subscribe((bet: PlacedBet) => {
          console.log('yes!');
        })
      })

    this.sportService.getAccountSettings()
      .subscribe((settings: AccountSettings) => {
        this.accountSettings = settings;
      })
  }

  ngOnDestroy() {
    this.clockSubscripion.unsubscribe();
  }

  updateBetStatus(bet: PlacedBet) {
    const time = new Date().getTime();
    const matchStartTime = bet.match.start_time;
    const matchDuration = Math.floor((time - matchStartTime) / (1000 * 60));
    
    if (matchDuration > 0 && bet.betStatus === 'Waiting for start') {
      bet.betStatus = 'Live';
      return this.sportService.updateBet(bet);
    }

    if (matchDuration > 90 && bet.betStatus === 'Live') {
      bet.betStatus = this.isBetWon(bet) ? 'Won' : 'Lost';
      return this.sportService.updateBet(bet);
    }
  }

  isBetWon(bet: PlacedBet) {
    const result = bet.match.result.matchResult;
    const placedOn = bet.runnerDetails;

    console.log(bet);

    switch(result) {
      case 'W':
        return placedOn === bet.match.teams[0] ? true : false;

      case 'L':
        return placedOn === bet.match.teams[1] ? true : false;

      case 'D':
        return placedOn === 'The Draw' ? true : false;
    }
  }

  updateAccountSettings(settings: AccountSettings, bet: PlacedBet) {
    this.accountSettings.available_credit += bet.stake * bet.odds - bet.stake;
    this.sportService.updateAccountSettings(settings);
  }
}
