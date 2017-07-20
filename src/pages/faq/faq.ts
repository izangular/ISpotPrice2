import { Component } from '@angular/core';
import { NavController, AlertController} from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';

import { StylingService } from '../../providers/styling-service';

import { Network } from '@ionic-native/network';
import * as packagejson  from '../../../package.json';

@Component({
  selector: 'page-faq',
  templateUrl: 'faq.html'
})
export class FaqPage {
  public packageParsed:any;

  constructor(
              public navCtrl: NavController,
              private alertCtrl: AlertController,
              private authService: AuthService,
              private stylingService: StylingService,
              private network: Network
              ) {
    this.packageParsed = packagejson;
  }

  
  ionViewDidEnter(){
  }

}
