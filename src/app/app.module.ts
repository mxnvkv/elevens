import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MyMarketsComponent } from './containers/my-markets/my-markets.component';
import { SportComponent } from './containers/sport/sport.component';
import { FootballComponent } from './containers/football/football.component';
import { CricketComponent } from './containers/cricket/cricket.component';
import { HorseRacingComponent } from './containers/horse-racing/horse-racing.component';

@NgModule({
  declarations: [
    AppComponent,
    MyMarketsComponent,
    SportComponent,
    FootballComponent,
    CricketComponent,
    HorseRacingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
