import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MyMarketsComponent } from './containers/my-markets/my-markets.component';
import { SportComponent } from './containers/sport/sport.component';
import { FootballComponent } from './containers/football/football.component';
import { CricketComponent } from './containers/cricket/cricket.component';
import { HorseRacingComponent } from './containers/horse-racing/horse-racing.component';
import { HttpClientModule } from '@angular/common/http';
import { CompetitionComponent } from './containers/competition/competition.component';
import { MatchComponent } from './containers/match/match.component';
import { AccountSettingsComponent } from './containers/account-settings/account-settings.component';
import { AccountSettingsKeyPipe } from './pipes/account-settings-key.pipe';
import { ReversePipe } from './pipes/reverse/reverse.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MyMarketsComponent,
    SportComponent,
    FootballComponent,
    CricketComponent,
    HorseRacingComponent,
    CompetitionComponent,
    MatchComponent,
    AccountSettingsComponent,
    AccountSettingsKeyPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [ReversePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
