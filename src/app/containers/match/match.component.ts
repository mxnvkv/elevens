import { Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SportServiceService } from 'src/app/services/sport.service';
import { Match } from 'src/app/models/match';
import { OddsDetails } from 'src/app/models/odds-details';
import { PlacedBet } from 'src/app/models/placed-bet';
import { v4 as uuidv4 } from 'uuid';
import { AccountSettings } from 'src/app/models/account-settings';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {

  account: AccountSettings;
  match: Match;
  matchOdds: OddsDetails[] = [];
  market: OddsDetails;
  matchID: string;
  bet: PlacedBet;
  isBetInvalid: boolean = true;
  leagueName: string

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
    this.sportService.getMatch(this.leagueName, this.matchID)
      .subscribe((data: Match) => {
        this.match = data;

        this.matchOdds = [
          { runnerDetails: data.teams[0], odds: data.site.odds.h2h[0] },
          { runnerDetails: data.teams[1], odds: data.site.odds.h2h[1] },
          { runnerDetails: 'The Draw', odds: data.site.odds.h2h[2] },
        ]
      });

    this.sportService.getAccountSettings()
      .subscribe((data: AccountSettings) => this.account = data);
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
    this.bet = {
      runnerDetails: this.market.runnerDetails,
      odds: this.market.odds,
      stake: parseFloat(parseFloat(stakeValue.toString()).toFixed(2)),
      placedTime: + new Date(),
      match: this.match,
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
}
