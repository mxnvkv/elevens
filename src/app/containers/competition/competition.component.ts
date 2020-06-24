import { Component, OnInit, Input } from '@angular/core';
import { Match } from 'src/app/models/match';
import { Router } from '@angular/router';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss']
})
export class CompetitionComponent implements OnInit {

  // router: string

  @Input() 
  league: Match[];

  constructor(private _router: Router) {
    // this.router = _router.url;
    // console.log(this.router);
  }

  ngOnInit(): void {}

}
