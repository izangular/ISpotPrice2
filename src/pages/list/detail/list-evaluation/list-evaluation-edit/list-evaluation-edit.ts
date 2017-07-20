import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, AlertController } from 'ionic-angular';
import { StylingService } from '../../../../../providers/styling-service';
import { AmsApiService } from '../../../../../providers/api-service';
import { ListEvaluationEditorHistoricPage } from './list-evaluation-edit-historic/list-evaluation-edit-historic'
import { Keyboard } from '@ionic-native/keyboard';

import { Network } from '@ionic-native/network';

@Component({
  selector: 'page-list-evaluation-edit',
  templateUrl: 'list-evaluation-edit.html',
  providers: []
})
export class ListEvaluationEditorPage {
  private valuationData: any;
  private valuationDataOriginal: any;
  private appraise: any;
  public loading: Loading;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private stylingService: StylingService,
    private alertCtrl: AlertController,
    private amsApiService: AmsApiService,
    private loadingCtrl: LoadingController,
    private keyboard: Keyboard,
    private network: Network

  ) 
    {
      this.appraise = navParams.get('appraise');

      this.valuationData = this.copyObjects(navParams.get('item')); //navParams.get is a pointer and if the user modifies something but not save, it is locally saved and can bring confisions if opens again the same window
      this.valuationDataOriginal = this.copyObjects(this.valuationData ); 
      this.getEnumsData();
      this.getFieldHistoric();
      keyboard.disableScroll(true);
  }

  private getFieldHistoric() {
    let loadingHistoric = this.loadingCtrl.create({ content: 'Getting data...' });
    loadingHistoric.present();
      this.amsApiService.getAttributeLog(this.appraise.id, this.valuationData.key).subscribe(
        (history) => {
        this.valuationData.history = history;
        this.valuationDataOriginal = this.copyObjects(this.valuationData ); 
        loadingHistoric.dismiss();
    },
      (err)=>{
        loadingHistoric.dismiss();
        this.showError(err);
      });
  }

  private getEnumsData() {
      if (this.valuationData.type === 'enumrange') this.getEnumRangeValues();      
      else if (this.valuationData.type === 'enum') this.getEnumValues();      
  }

  private copyObjects(objOrigin) {
      this.formatDatamodelIonic2();
      let objDest=Object.assign({}, objOrigin); //Copy without reference
      return objDest;
  }

  private formatDatamodelIonic2() {
      if (this.valuationData && !this.valuationData.statusCode ) this.valuationData.statusCode = ''; //Hack for show "none" if there is no value, null is not recognized on ion-option
      if (this.valuationData && (this.valuationData.type === 'float' || this.valuationData.type === 'currency' )) {
        if (this.valuationData.value) this.valuationData.value = parseFloat(this.valuationData.value);
      }
      if (this.valuationData && (this.valuationData.type === 'bit' )) {
        if (this.valuationData.value == true || this.valuationData.value === '1' )
          this.valuationData.value = true;
        else this.valuationData.value = false;
      }
  }

  public isDataModified() {
    return JSON.stringify(this.valuationData) !== JSON.stringify(this.valuationDataOriginal);
  }

  public getEnumRangeValues() {
    this.amsApiService.getRanges(this.valuationData.key).subscribe((attributes) => {
        this.valuationData.valuesEnum = attributes;
        this.valuationDataOriginal = this.copyObjects(this.valuationData ); 
    });
  }

  public getEnumValues() {
    this.amsApiService.getAttributes(this.valuationData.key).subscribe((attributes) => {
        this.valuationData.valuesEnum = attributes;
        this.valuationDataOriginal = this.copyObjects(this.valuationData ); 
    });
  }

  public getEnumRangeLabel(valuationEnum, valuationValue) {
    if (!valuationEnum) return '';
    for (let cont=0; cont < valuationEnum.length; cont ++) {
      if ( valuationEnum[cont].valueMin <= valuationValue && valuationEnum[cont].valueMax >= valuationValue){
        return valuationEnum[cont].label;
      }
    };
  }

  public parseValidators(validators) {
    return JSON.parse(validators).validators;
  }

  public getValue(data) {
              console.log('GetValue...........');

    switch (data.type) {
        case 'float' : 
          if (!data.value || data.value === null || data.value === 'undefined') return '';
          console.log(parseFloat(data.value));
          return parseFloat(data.value);
        case 'currency' : 
          if (!data.value || data.value === null || data.value === 'undefined') return '';
          return parseFloat(data.value).toLocaleString('DE-CH');
        default : return data.value;
    }
  }

  public getValuationStatusCode(value) {
    return value || '';
  }

  public setData() {
    let loadingHistoric = this.loadingCtrl.create({ content: 'Saving data...' });
    loadingHistoric.present();
    this.amsApiService.updateAppraisalObjectData(this.appraise.id, { [this.valuationData.key] : this.valuationData })
      .subscribe(
        () => {
        this.valuationDataOriginal = this.copyObjects(this.valuationData ); 
        loadingHistoric.dismiss();
        this.getFieldHistoric();
        },
        (err) => {
          loadingHistoric.dismiss();
          this.showError(err);
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

  historicTapped(item) {
    this.navCtrl.push(ListEvaluationEditorHistoricPage, {
      field: item
    });
  }

}
