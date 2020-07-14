import { Component, OnInit, OnDestroy } from '@angular/core';
import { SportServiceService } from 'src/app/services/sport.service';
import { PlacedBet } from 'src/app/models/placed-bet';
import { Subscription, concat } from 'rxjs';

@Component({
  selector: 'app-my-markets',
  templateUrl: './my-markets.component.html',
  styleUrls: ['./my-markets.component.scss']
})
export class MyMarketsComponent implements OnInit, OnDestroy {

  bets: PlacedBet[] = [];
  clockSubscripion: Subscription;
  currentTime: Date;

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
      .subscribe((data: Date) => {
        let observables = [];

        this.bets.forEach((bet: PlacedBet) => {
          this.matchStatus(bet) === undefined ? null : observables.push();
        })

        concat(...observables).subscribe((placedBet: PlacedBet) => {
          this.bets.forEach((bet: PlacedBet) => {
            if (bet.id === placedBet.id) {
              bet = { ...placedBet };
            }
          })
        })
      })
  }

  ngOnDestroy() {
    this.clockSubscripion.unsubscribe();
  }

  matchStatus(bet: PlacedBet) {
    const currentTime = new Date().getTime();
    const matchTime = currentTime - bet.match.start_time;
    const matchMinute = Math.floor(matchTime / 1000 / 60);

    if (matchTime > 0 && matchMinute < 91 && bet.betStatus !== 'Live') {

      bet.betStatus = 'Live';
      return this.sportService.updateBet(bet);

    } else if (matchTime > 0 && matchMinute >= 91) {

      const result = bet.match.result.matchResult;

      switch(result) {
        case 'W':
          bet.betStatus = bet.runnerDetails === bet.match.teams[0] ? 'Won' : 'Lost';
          return this.sportService.updateBet(bet);
          break;

        case 'L':
          bet.betStatus = bet.runnerDetails === bet.match.teams[1] ? 'Won' : 'Lost';
          return this.sportService.updateBet(bet);
          break;

        case 'D':
          bet.betStatus = 
            bet.runnerDetails !== bet.match.teams[0] 
            && bet.runnerDetails !== bet.match.teams[1] ? 'Won' : 'Lost';
            return this.sportService.updateBet(bet);
          break;
      }
    }
  }
}
