import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, AlertController } from 'ionic-angular';
import { MediaPlugin, MediaObject } from '@ionic-native/media';
import { ListEvaluationEditorPage } from './list-evaluation-edit/list-evaluation-edit';
import { StylingService } from '../../../../providers/styling-service';
import { AmsApiService } from '../../../../providers/api-service';

import { Network } from '@ionic-native/network';

import { File } from '@ionic-native/file';

import * as moment from 'moment';


@Component({
  selector: 'page-list-evaluation',
  templateUrl: 'list-evaluation.html',
  providers: []
})
export class ListEvaluationPage {
  appraise: any;
  valuationLayoutBySectionsOriginal: any;
  valuationLayoutBySectionsFiltered: any;
  loading: Loading;
  apiVersion: number = 2;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private file: File,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private media: MediaPlugin,
    private stylingService: StylingService,
    private amsApiService: AmsApiService,
    private network: Network
  ) 
    {
      this.appraise = navParams.get('item');
      this.refreshList();

  }

  ionViewDidEnter(){
    this.doRefresh(null);
  }

  refreshList() {
      this.valuationLayoutBySectionsOriginal = [];
      this.valuationLayoutBySectionsFiltered = [];
      this.getAppraiseValuationDataGroups(this.appraise.valuationLayout);
  }


  valueTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(ListEvaluationEditorPage, {
      item: item,
      appraise: this.appraise
    });
  }

  getAppraiseValuationDataGroups(valuationLayout) {
    this.mergeLayoutData(this.appraise.valuationLayout, this.appraise.valuationData);

    for(let cont = 0; cont < valuationLayout.length; cont ++) {
      if (!this.isSection(valuationLayout[cont].groupLabel, this.valuationLayoutBySectionsOriginal)) {
        this.valuationLayoutBySectionsOriginal.push(
                                  {'name' : valuationLayout[cont].groupLabel  , 
                                  'elements' : this.getByValue(valuationLayout, valuationLayout[cont].groupLabel ) 
                                });
      }
    }
    this.resetElements();
  }

  resetElements() {
    this.valuationLayoutBySectionsFiltered = this.valuationLayoutBySectionsOriginal;
  }

  filterElements(ev: any) {
    // Reset items back to all of the items
    this.resetElements();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {

      //Filtering elements
      this.valuationLayoutBySectionsFiltered = this.valuationLayoutBySectionsFiltered.map((item) => {
        let objFiltered :any = {};
        objFiltered.name = item.name;
        objFiltered.elements = item.elements.filter((element)=> {
                      return element.keyLabel.toLowerCase().indexOf(val.toLowerCase()) > -1
                    });
        return objFiltered; 
      });

      //removing empty headers
      this.valuationLayoutBySectionsFiltered = this.valuationLayoutBySectionsFiltered.filter((element) => {
        return element.elements.length != 0;
      });

    }
  }

  mergeLayoutData(arrayLayout, arrayData) {
    for (let elementLayout of arrayLayout) {
      let elementData = arrayData.find(x => x.key === elementLayout.key);
      if  (elementData) {
        elementLayout.value = elementData.value; 
        elementLayout.sourceCode = elementData.sourceCode; 
        elementLayout.comment = elementData.comment; 
        elementLayout.statusCode = elementData.statusCode; 
        elementLayout.valueLabel = elementData.valueLabel;
      }
    }
  }

  getByValue(arr, value) {
    let result  = arr.filter(function(o){return o.groupLabel == value;} );
    return result;
  }

  isSection(sectionName, sectionsArray) {
    return (sectionsArray.filter(function(e) { return e.name == sectionName; }).length > 0);
  }

  parseFloat(dataFloat) {
    if (!dataFloat || dataFloat === null || dataFloat === 'undefined') return '';
    return parseFloat(dataFloat);
  }

  parseCurrency(dataFloat) {
    //needs to be different than decimal or latitude and longitude is truncated
    if (!dataFloat || dataFloat === null || dataFloat === 'undefined') return '';
    return parseFloat(dataFloat).toLocaleString('DE-CH');
  }

  showError(text) {    
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }


  doRefresh(refresher) {
    let loadingRefresh = this.loadingCtrl.create({ content: 'Getting data...' });
    loadingRefresh.present();

    this.amsApiService.getAppraisalObjectData(this.appraise.id, this.apiVersion).subscribe((requestData: any) => {
        this.appraise.valuationData = requestData;

        this.amsApiService.getAppraisalObjectDataLayout(this.appraise.id, {
          'layoutName': 'intrinsic',
          'version': this.apiVersion
        }).subscribe(
        (data) => {
          console.log(data);
          this.appraise.valuationLayout = data;
          this.refreshList();

          loadingRefresh.dismiss();
          if (refresher) refresher.complete();
        },
        (err) =>{
          this.showError(err);
          if (refresher) refresher.complete();    
        });
      });
  }

  getBitValue(value) {
    if (value === '1' || value === true) return true;
    return false;
  }
}
