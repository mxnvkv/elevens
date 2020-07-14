import { Component, OnInit, Renderer2, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SportServiceService } from 'src/app/services/sport.service';
import { Match } from 'src/app/models/match';
import { OddsDetails } from 'src/app/models/odds-details';
import { PlacedBet } from 'src/app/models/placed-bet';
import { v4 as uuidv4 } from 'uuid';
import { AccountSettings } from 'src/app/models/account-settings';
import { AppComponent } from 'src/app/app.component';
import { Subscription, interval } from 'rxjs';
import { map, takeWhile, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit, OnDestroy {

  account: AccountSettings;
  match: Match;
  matchOdds: OddsDetails[] = [];
  market: OddsDetails;
  matchID: string;
  bet: PlacedBet;
  isBetInvalid: boolean = true;
  leagueName: string
  currentMatchTime: number;
  matchTimeSubscription: Subscription;
  homeTeamScore: number = 0;
  awayTeamScore: number = 0;

  @ViewChild('betPlacement') betPlacement: ElementRef;
  @ViewChild('stake') stake: ElementRef;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private sportService: SportServiceService,
    private appComponent: AppComponent
  ) { 
    this.matchID = router.url.split('/').pop();
    this.leagueName = router.url.split('/')[2];
  }

  ngOnInit(): void {
    this.sportService.getMatch(`${this.leagueName}_schedule`, this.matchID)
      .subscribe((data: Match) => {
        this.match = data;

        this.matchOdds = [
          { runnerDetails: data.teams[0], odds: data.site.odds.h2h[0] },
          { runnerDetails: data.teams[1], odds: data.site.odds.h2h[1] },
          { runnerDetails: 'The Draw', odds: data.site.odds.h2h[2] },
        ];

        this.setMatchTime();
        console.log(data);
        data.result.scoreChanges.forEach((score: number) => {
          console.log(`${score[0][0]} : ${score[0][1]} (${score[1]}')`);
        })
      });

    this.sportService.getAccountSettings()
      .subscribe((data: AccountSettings) => this.account = data);
  }

  ngOnDestroy() {
    if (this.currentMatchTime) {
      this.matchTimeSubscription.unsubscribe();
    }
  }

  showPlaceBet(event: Event, market: OddsDetails) {
    const betPlacement = this.betPlacement.nativeElement;
    this.renderer.setStyle(betPlacement, 'display', 'inline-block');

    // adding odds to the template
    const oddsField = betPlacement.querySelector('.bet-info-odds > .field');
    oddsField.innerHTML = market.odds;

    this.market = market;

    const betParent = this.renderer.parentNode(event.target);
    const betWrapper = this.renderer.parentNode(betParent);
    const nextBetSibling = this.renderer.nextSibling(betParent);

    if (market.runnerDetails === 'The Draw') {
      this.renderer.appendChild(betWrapper, betPlacement);
    } else {
      this.renderer.insertBefore(betWrapper, betPlacement, nextBetSibling);
    }

    this.stake.nativeElement.focus();
  }

  cancel() {
    this.betPlacement.nativeElement.remove();
  }

  placeBet(stakeValue: number) {
    let match = { ...this.match };
    delete match.result.scoreChanges;

    this.bet = {
      runnerDetails: this.market.runnerDetails,
      odds: this.market.odds,
      stake: parseFloat(parseFloat(stakeValue.toString()).toFixed(2)),
      placedTime: + new Date(),
      betStatus: 'Waiting for start',
      match: match,
      id: uuidv4()
    }
    
    this.sportService.placeBet(this.bet).subscribe(() => console.log('Bet placed: ' + this.bet.id));

    this.account.available_credit -= this.bet.stake;
    this.sportService.updateAccountSettings(this.account).subscribe(() => {
      console.log('Account settings updated');
    });

    this.betPlacement.nativeElement.remove();

    this.appComponent.updateAvailableStake();
  }

  checkStake(stakeValue: any) {
    if (
        stakeValue && 
        /^[0-9,.]*$/.test(stakeValue) && 
        parseFloat(stakeValue) !== NaN &&
        this.account?.available_credit >= stakeValue
      ) {
      this.isBetInvalid = false;
    } else {
      this.isBetInvalid = true;
    }
  }

  setMatchTime() {
    if (this.match.isMatchLive && new Date().getTime() >= this.match.start_time) {
      this.matchTimeSubscription = interval(1000).pipe(
        map(tick => {
          return Math.floor((new Date().getTime() - this.match.start_time) / 1000 / 60)
        }),
        takeWhile(minutes => minutes < 91),
        finalize(() => {
          this.currentMatchTime = 91
        })
      ).subscribe(time => {
        this.currentMatchTime = time;

        // setting current match score
        this.match.result.scoreChanges.forEach((matchScore: number) => {
          if (matchScore[1] <= time) {
            this.homeTeamScore = matchScore[0][0];
            this.awayTeamScore = matchScore[0][1];
          }
        })
      });
    }
  }
}
