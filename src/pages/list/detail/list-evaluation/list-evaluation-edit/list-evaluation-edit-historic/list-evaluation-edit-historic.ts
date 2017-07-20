import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, AlertController } from 'ionic-angular';
import { StylingService } from '../../../../../../providers/styling-service';
import { AmsApiService } from '../../../../../../providers/api-service';

import { Network } from '@ionic-native/network';


@Component({
  selector: 'page-list-evaluation-edit-historic',
  templateUrl: 'list-evaluation-edit-historic.html',
  providers: []
})
export class ListEvaluationEditorHistoricPage {
  private field: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private stylingService: StylingService,
    private alertCtrl: AlertController,
    private amsApiService: AmsApiService,
    private loadingCtrl: LoadingController,
    private network: Network
  ) 
    {
      this.field = navParams.get('field');
      console.log(this.field);
  }

  showError(text) { 
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }

}
