import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyMarketsComponent } from './containers/my-markets/my-markets.component';
import { FootballComponent } from './containers/football/football.component';
import { CricketComponent } from './containers/cricket/cricket.component';
import { HorseRacingComponent } from './containers/horse-racing/horse-racing.component';
import { CompetitionComponent } from './containers/competition/competition.component';
import { MatchComponent } from './containers/match/match.component';
import { AccountSettingsComponent } from './containers/account-settings/account-settings.component';


const routes: Routes = [
  { path: '', redirectTo: 'football', pathMatch: 'full' },
  { path: 'markets', component: MyMarketsComponent },
  { path: 'account-settings', component: AccountSettingsComponent },
  { 
    path: 'football', 
    children: [
      { path: '', component: FootballComponent },
      { path: ':sport_key', component: CompetitionComponent, },
      { path: ':sport_key/:id', component: MatchComponent },
    ]
  },
  { path: 'cricket', component: CricketComponent },
  { path: 'horse-racing', component: HorseRacingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
