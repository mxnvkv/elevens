import { Component, OnInit, Input } from '@angular/core';
import { Match } from 'src/app/models/match';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss']
})
export class CompetitionComponent implements OnInit {

  @Input() 
  league: Match[];

  constructor() {

  }

  ngOnInit(): void {
    
  }

}
