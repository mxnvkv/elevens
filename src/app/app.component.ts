import { Component, ViewChild, ElementRef, Renderer2, OnInit, AfterViewInit } from '@angular/core';
import { Observable, fromEvent, concat } from 'rxjs';
import { map, skip, takeWhile, finalize } from 'rxjs/operators';
import { SportServiceService } from './services/sport.service';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { AccountSettings } from './models/account-settings';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Match } from './models/match';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('OpenCloseMenu', [
      state('true', style({ marginLeft: '0px' })),
      state('false', style({ marginLeft: '-300px' })),
      transition('false <=> true', [animate(300)])
    ]),

    trigger('OpenCloseApp', [
      state('true', style({ marginLeft: '300px' })),
      state('false', style({ marginLeft: '0' })),
      transition('false <=> true', [animate(300)])
    ])
  ]
})

export class AppComponent implements OnInit {
  @ViewChild('app') app: ElementRef;
  @ViewChild('menu') menu: ElementRef;
  @ViewChild('toggleMenuElement') toggleMenuElement: ElementRef;

  clickEvents: Observable<Event> = fromEvent(document, 'click');
  accountSettings: AccountSettings;
  currentUrl: string;
  currentUrlLength: number;
  currentLocation;
  isMenuOpen: boolean = false;
  currentTime: Date;
  allLeagueNames: string[];
  allScheduledMatches: Match[][] = [];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private location: Location,
    private sportService: SportServiceService,
  ) {
    this.currentLocation = location;
  }

  ngOnInit() {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;

        // [ "", "football", "soccer_epl" ]
        // if the length of array is more than 2, then we will
        // display back arrow instead of menu 
        this.currentUrlLength = event.url.split('/').length;
      }
    })

    this.sportService.getAccountSettings()
      .subscribe((data: AccountSettings) => this.accountSettings = data);

    this.allLeagueNames = this.sportService.getAllLeagueNames();
    
    this.allLeagueNames.forEach((leagueName) => {
      this.sportService.getLeague(`${leagueName}_schedule`)
        .subscribe((data: Match[]) => {
          data = data.filter((match: Match) => new Date().getTime() >= match.start_time)
          this.allScheduledMatches.push(data);
        })
    });

    this.sportService.getClock()
      .subscribe((data: Date) => {
        if (data.getSeconds() === 10) {
          this.deleteFinishedMatches();
        }
      })
  }

  toggleMenu() {
    this.isMenuOpen = true;

    // removing toggle-menu down, because when
    // we click on it, menu closes but new observable
    // starts again and we need to click away to finish it
    // and be able to open menu
    this.renderer.setStyle(this.toggleMenuElement.nativeElement, 'z-index', '-1');

    // menu is opened, and closes when we click outside of itself
    this.clickEvents.pipe(
      map((event: Event) => (event.target as Element).className),
      skip(1),
      takeWhile(value => value === 'menu'),
      finalize(() => {

        this.isMenuOpen = false;

        // bringing toggle-menu up
        this.renderer.setStyle(this.toggleMenuElement.nativeElement, 'z-index', '1');
      })
    ).subscribe();
  }

  back() {
    this.currentLocation.back();
  }

  updateAvailableStake(): void {
    this.sportService.getAccountSettings()
      .subscribe((data: AccountSettings) => this.accountSettings = data);
  }

  deleteFinishedMatches() {
    let observables = [];

    this.allScheduledMatches.forEach((league: Match[]) => {

      league.forEach((match: Match) => {
        const matchMinutes = Math.floor((new Date().getTime() - match.start_time) / 1000 / 60);

        if (match.isMatchLive && matchMinutes > 90) {
          
          observables.push(
            this.sportService.deleteMatchFromSchedule(match)
          )
        }
      })
    })

    concat(...observables).subscribe();
  }
}
