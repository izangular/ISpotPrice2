import { Component } from '@angular/core';
import { NavController, AlertController} from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { StylingService } from '../../providers/styling-service';
import { EnvironmentService } from '../../providers/environment-service';

import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public userJson: string;
  public cultureSelected: string;
  public environmentId: number = -1;
  constructor(
              public navCtrl: NavController,
              private alertCtrl: AlertController,
              private authService: AuthService,
              private network: Network,
              private stylingService: StylingService,
              private environmentService: EnvironmentService,
              public translateService: TranslateService
              ) {
              /*authService.getUserDetails().
                  subscribe(
                  (userData) => {
                    this.userJson = userData;
                  });*/
              this.cultureSelected = translateService.getDefaultLang();
  }

  public onSelectLanguageChange(value) {
    this.translateService.setDefaultLang(value);
  }

}
