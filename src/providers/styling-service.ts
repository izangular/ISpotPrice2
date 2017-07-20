import { Injectable } from '@angular/core';

@Injectable()
export class StylingService {

  constructor() {
  }

  public getNetworkColor(networkType: string) {
    if (!networkType || networkType === 'none') {
      return 'danger';
    } else {
      return'secondary';
    }
  }

  public getNetworkIcon(networkType: string) {
    if (!networkType || networkType === 'none') {
      return 'close';
    } else {
      return'checkmark';
    }
  }

  public getStyleBarBySourceCode(sourceCode: string) {
    if (sourceCode === 'I') {
      return'imported source-bar';
    } else if (sourceCode === 'C') {
      return'automatic source-bar';
    } else if (sourceCode === 'M') {
      return 'manual source-bar';
    } else {
      return 'undefined source-bar';
    }
  }

  public getStyleIconBySourceCode(sourceCode: string) {
    if (sourceCode === 'I') {
      return'imported source-icon';
    } else if (sourceCode === 'C') {
      return'automatic source-icon';
    } else if (sourceCode === 'M') {
      return 'manual source-icon';
    } else {
      return 'undefined source-icon';
    }
  }

  public getStyleIconByStatusCode(statusCode: string) {
    if (statusCode === 'R') {
      return'red status-icon';
    } else if (statusCode === 'G') {
      return'green status-icon';
    } else {
      return 'undefined status-icon';
    }
  }

  private getStyleHomeIcon(date: string) {
    let now = new Date();
    let itemDate = new Date(date);
    console.log('Comparing now : '+now+' || visitDateTime : ' +itemDate);
    if (itemDate < now )
      return 'item item-block item-md icon-appraisal-past';
    else if (this.isToday(itemDate) )
      return 'item item-block item-md icon-appraisal-today';
    else if (this.isTomorrow(itemDate) )
      return 'item item-block item-md icon-appraisal-tomorrow';
    else
      return 'item item-block item-md';
  }

  private isTomorrow(itemDate){
      let now = new Date();
      var date1_tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      if (date1_tomorrow.getFullYear() == itemDate.getFullYear() && date1_tomorrow.getMonth() == itemDate.getMonth() && date1_tomorrow.getDate() ==   itemDate.getDate()) {
      return true;
      }
    }

    private isToday(itemDate){
      let now = new Date();
      var date1_tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (date1_tomorrow.getFullYear() == itemDate.getFullYear() && date1_tomorrow.getMonth() == itemDate.getMonth() && date1_tomorrow.getDate() ==   itemDate.getDate()) {
      return true;
      }
    }

}
