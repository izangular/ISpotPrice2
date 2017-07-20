import { Injectable } from '@angular/core';
import {
  Http, Response, Headers, RequestOptions, ResponseContentType,
  URLSearchParams
} from '@angular/http';
import { Observable } from 'rxjs/Rx';
import * as Rx from "rxjs/Rx";

import { AuthService } from './auth-service';
import { EnvironmentService } from './environment-service';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';

import { Storage } from '@ionic/storage';

@Injectable()
export class AmsApiService {

  private static ROOT_PATH = '/api';
  private customerId: string;
  private isOnline: boolean;
  readonly customerId$: Observable<any>;

  public constructor(
    public http: Http,
    public authService: AuthService,
    private transfer: Transfer,
    private storage: Storage,
    private network: Network,
    private translateService: TranslateService,
    private environmentService: EnvironmentService
  ) {
  }

  public getRequestDocuments(requestId: string): Observable<any> {
    return this.get('/v1/appraisal/' + requestId + '/documents');
  };

  public getVisits(): Observable<any> {
    return this.get('/v1/visit');
  }

  public uploadMedia(appraiseId: string, data): Promise<any> {
  var options = {
    fileKey: "file",
    fileName: data.filename,
    chunkedMode: false,
    mimeType: data.fileMime,
    params : {'fileName': data.filename, 'documentType' : data.documentType},
    headers : {
      'Authorization': `Bearer `+this.authService.getUserToken() ,
      'X-Culture' : this.translateService.getDefaultLang() ,
      'X-Customer-Id' : this.authService.getUserProfile().customerId
    }
  };

    const fileTransfer: TransferObject = this.transfer.create();
    var url = this.environmentService.getEnvironment().API_HOST + AmsApiService.ROOT_PATH + '/v1/appraisals/'+ appraiseId + "/document-upload";

    return fileTransfer.upload(data.targetPath, url, options);
  }


  public downloadDocument(documentId: number): Observable<any> {
    console.log('downloadingDocument...');
    let headers = new Headers();
    let authToken = this.authService.getUserToken();
    headers.append('Authorization', `Bearer ${authToken}`);
    headers.append('X-Culture', this.translateService.getDefaultLang());
    headers.append('X-Customer-Id', this.authService.getUserProfile().customerId);
    let options = new RequestOptions({
      headers: headers,
      responseType: ResponseContentType.Blob
    });
    console.log('downloadingDocument : '+documentId);

    return this.http.get(this.environmentService.getEnvironment().API_HOST + AmsApiService.ROOT_PATH + '/v1/download/document/' + documentId, options)
      .map(res => res.blob())
      .catch(this.handleError.bind(this));
  }

  public getAppraisalObjectDataLayout(requestId: string, params: any): Observable<any> {
    return this.get('/v1/appraisal/' + requestId + '/object-data-layout?' + this.getParamsAsString(params));
  };

  public getAttributes(attributeKey: string): Observable<any> {
    return this.get('/v2/attributes/' + attributeKey);
  };

  public getAttributeLog(requestId: string, attributeKey: string): Observable<any> {
    return this.get('/v1/attribute/' + attributeKey + '/' + requestId);
  };

  public getRanges(rangeKey: string): Observable<any> {
    return this.get('/v1/ranges/' + rangeKey);
  };

  public updateAppraisalObjectData(requestId, data): Observable<any> {
    return this.post('/v1/appraisal/' + requestId + '/object-data', data);
  }
  
  public getAppraisalObjectData(requestId: string, version: number): Observable<any> {
    return this.get('/v1/appraisal/' + requestId + '/object-data/' + version);
  };


  private post(url, data): Observable<any> {
    let headers = new Headers();
    let authToken = this.authService.getUserToken();
    headers.append('Authorization', `Bearer ${authToken}`);
    headers.append('Content-Type', 'application/json');
    headers.append('X-Culture', this.translateService.getDefaultLang() );
    headers.append('X-Customer-Id', this.authService.getUserProfile().customerId );
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this.environmentService.getEnvironment().API_HOST + AmsApiService.ROOT_PATH + url, data, options)
      .map(this.extractData.bind(this))
      .catch(this.handleError.bind(this));
  }

  private get(url): Observable<any> {
    let headers = new Headers();
    let authToken = this.authService.getUserToken();
    headers.append('Authorization', `Bearer ${authToken}`);
    headers.append('X-Culture', this.translateService.getDefaultLang() );
    headers.append('X-Customer-Id', this.authService.getUserProfile().customerId );
    let options = new RequestOptions({ headers: headers });
    
    if ( this.isNetwork() ) return this.returnCachedData(this.environmentService.getEnvironment().API_HOST + AmsApiService.ROOT_PATH + url);
    else return this.http.get(this.environmentService.getEnvironment().API_HOST + AmsApiService.ROOT_PATH + url, options)
      .map(this.extractData.bind(this))
      .catch(this.handleError.bind(this));

  }

  private delete(url): Observable<any> {
    let headers = new Headers();
    let authToken = localStorage.getItem('auth_token');
    headers.append('Authorization', `Bearer ${authToken}`);
    headers.append('X-Culture', this.translateService.getDefaultLang());
    headers.append('X-Customer-Id', this.customerId);
    let options = new RequestOptions({ headers: headers });

    return this.http.delete(this.environmentService.getEnvironment().API_HOST + AmsApiService.ROOT_PATH + url, options)
      .map(this.extractData.bind(this))
      .catch(this.handleError.bind(this));

  }

  private getParamsAsString(params) {
    let paramsArr = [];
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        paramsArr.push(key + '=' + params[key]);
      }
    }
    return paramsArr.join('&');
  }

  private extractData(res: Response) {
    console.log('Data from server !')
    this.storage.set(res.url, res.json().data );

    try {
      let body = res.json();
      return body.data || {};
    } catch (e) {
      return res;
    }
  }

  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      if (error.status === 401) {
        // localStorage.removeItem('auth_token'); TODO - Temp disabled due endopoints modifications
        // this.router.navigate(['']);
      }
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    return Observable.throw(errMsg);
  }

  private isNetwork() {
    if (this.network) return this.network.type === 'none';
    else return false;
  }

  private returnCachedData(url) {
    return Rx.Observable.create(observer => {
      this.storage.get(url).then((val) => {
          console.log('Data from caché !')
          observer.next(val || {} );
        });
      });
  }

  ///////////////////////////////////////////
}
