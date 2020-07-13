import { Component, OnInit } from '@angular/core';
import { SportServiceService } from 'src/app/services/sport.service';
import { AccountSettings } from 'src/app/models/account-settings';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {

  accountSettings: AccountSettings;
  balanceInformation;

  constructor(private sportService: SportServiceService) {}

  ngOnInit(): void {
    this.sportService.getAccountSettings()
      .subscribe((data: AccountSettings) => {
        this.accountSettings = data;

        this.balanceInformation = { ...data };
        delete this.balanceInformation.username;
        delete this.balanceInformation.soccer_schedule_time;
      });
  }
}
