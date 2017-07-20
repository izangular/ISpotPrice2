import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Loading, AlertController } from 'ionic-angular';

import { DetailPage } from './detail/detail';

import { AmsApiService } from '../../providers/api-service';
import { StylingService } from '../../providers/styling-service';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network';
import * as moment from 'moment';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
  providers: [AmsApiService]
})
export class ListPage {
  selectedItem: any;
  items: Array<{ appraise: any, icon: string }>;
  public loading: Loading;
  private appraisalsOriginal: any;
  private filterSelected: number = 1;



  constructor(
              public navCtrl: NavController, 
              public navParams: NavParams, 
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private amsApiService: AmsApiService,
              private stylingService: StylingService,
              private translateService: TranslateService,
              private network: Network
              ) {
  }

  ionViewDidEnter(){
    this.doRefresh(null);
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(DetailPage, {
      item: item
    });
  }


  showError(text) { 
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }

  showErrorNetwork() { 
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: this.translateService.instant('Network communication failure.'),
      buttons: ['OK']
    });
    alert.present(prompt);
  }

  doRefresh(refresher) {
    let loadingList = this.loadingCtrl.create({ content: 'Getting data...' });
    loadingList.present();

    this.amsApiService.getVisits().subscribe(
      (data) => {
      this.appraisalsOriginal = data;
      this.onSelectFilterChange(this.filterSelected);

      loadingList.dismiss();
      if (refresher) refresher.complete();
    },
    (err) =>{
      this.showError(err);
      loadingList.dismiss();
      if (refresher) refresher.complete();    }
    );

    moment.updateLocale( 'de' , {
      calendar: {
        lastDay : this.translateService.instant('[Yesterday at]') + ' HH:mm',
        sameDay : this.translateService.instant('[Today at]') + ' HH:mm',
        nextDay : this.translateService.instant('[Tomorrow at]') + ' HH:mm',
        lastWeek : this.translateService.instant('[last]') + ' dddd '+this.translateService.instant('[at]')+' HH:mm',
        nextWeek : 'dddd '+this.translateService.instant('[at]')+' HH:mm',
        sameElse : 'DD.MM.YYYY'
      } 
      });
  }

  onSelectFilterChange(value) {
    this.items = [];
    this.filterSelected = parseInt(value);
    switch(this.filterSelected) {
      case 0:
        this.resetAppraisals();
      break;
      case 1 :
        this.filterAppraisals( new Date(), null );
      break;
      default:
      break;
    }
  }

  private resetAppraisals() {
    this.items = [];

    for (let i = 0; i < this.appraisalsOriginal.length; i++) {
      this.items.push({
        appraise : this.appraisalsOriginal[i],
        icon: 'home'
      });
    }
  }


  private filterAppraisals(from, to){
    this.items = [];

    for (let i = 0; i < this.appraisalsOriginal.length; i++) {
      let visitDate = new Date( this.appraisalsOriginal[i].visitDateTime );

      if (!to) {
      if (visitDate >= from )
            this.items.push({
              appraise : this.appraisalsOriginal[i],
              icon: 'home'
            });
      }else {
      if (visitDate >= from 
          && visitDate <= to )
            this.items.push({
              appraise : this.appraisalsOriginal[i],
              icon: 'home'
            });
      }
    }
  }
}
