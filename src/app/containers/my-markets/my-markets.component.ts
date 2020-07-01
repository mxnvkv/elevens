import { Component, OnInit } from '@angular/core';
import { SportServiceService } from 'src/app/services/sport.service';
import { PlacedBet } from 'src/app/models/placed-bet';

@Component({
  selector: 'app-my-markets',
  templateUrl: './my-markets.component.html',
  styleUrls: ['./my-markets.component.scss']
})
export class MyMarketsComponent implements OnInit {

  bets: PlacedBet[] = [];

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
  }

}
