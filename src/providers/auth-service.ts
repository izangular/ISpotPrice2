import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { JwtHelper } from 'angular2-jwt';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import { EnvironmentService } from './environment-service';


@Injectable()
export class AuthService {
  public usernameAnnouncedSource = new Subject<string>();
  public usernameAnnounced$ = this.usernameAnnouncedSource.asObservable();
  public jwtHelper: JwtHelper = new JwtHelper();
  private loggedIn = false;
  public refreshingToken = false;
  public refreshingAtemps: any = 0;
  public profileUpdatedSource = new Subject();
  public profileUpdated$ = this.profileUpdatedSource.asObservable();

  constructor(
    private http: Http,
    private environmentService: EnvironmentService) {

  }

  public loginPortal(credentials) {
    
    this.setLoginForm(credentials);

    let header = new Headers();
        header.append('Content-Type', 'application/json');
    return this.http.post(
        this.environmentService.getEnvironment().AUTH_HOST + '/login',
        JSON.stringify(credentials), { headers: header }
      )
      .timeout(15000)
      .map((response: Response) => {
        let auth = response.json();
        if (auth && auth.token) {
            localStorage.setItem('auth_token', auth.token);
            localStorage.setItem('auth_token_type', auth.token_type);
          return auth.token;
        }else return null;
      }).catch(err => err);
  }

  public loginApp(portaltoken, appName) { /* (01) */
    console.log('loginWithToken');
    let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'bearer' + ' ' + portaltoken);
        headers.append('Accept', 'application/json');

    return this.http.post(
      this.environmentService.getEnvironment().AUTH_HOST + '/getAppToken', { 'app': appName }, { headers: headers }
      )
      .timeout(15000)
      .map((response: Response) => {
        let auth = response.json();
        if ( auth && auth.token ) {
          localStorage.setItem('app_token', auth.token);
          localStorage.setItem('app_token_type', auth.token_type);
          this.loggedIn = true;
          console.log('Loogedd...');
          return true;
        } else {
          Observable.throw('Not authorized');
        }
      }).catch(err => Observable.throw(err));
  }

  public refreshToken(credentials) {
    this.refreshingToken = true;
    this.refreshingAtemps++;
    console.log('TOken expired !! Refreshing token...');
    this.loginPortal(credentials).subscribe(
        portalToken => {
        console.log('answered:'+portalToken);
        if (portalToken) {        
          this.loginApp(portalToken, 'ams').subscribe(
            (result) => {
              // Give the man a chance to save the token...
              this.refreshingToken = false;
              return result;
            },
            (err) => {
              console.log(err);
              this.refreshingToken = false;
              return false;
            }
          );
        } else {
          this.refreshingToken = false;
          return false;
        }
    },
      error => {
        this.refreshingToken = false;
        return false;
      });
  }

  public doLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_type');
    localStorage.removeItem('app_token');
    localStorage.removeItem('app_token_type');

    localStorage.removeItem('login_form_keep');
    localStorage.removeItem('login_form_user');
    localStorage.removeItem('login_form_pass');
    this.refreshingAtemps = 0;
    this.loggedIn = false;
  }

  public setLoginForm(form) {
    localStorage.setItem('login_form_keep', form.keepLogin);
    localStorage.setItem('login_form_user', form.userEmail);
    localStorage.setItem('login_form_pass', form.userPwd);
  }

  public getLoginForm() {
    return {
      keepLogin : localStorage.getItem('login_form_keep'),
      userEmail : localStorage.getItem('login_form_user'),
      userPwd : localStorage.getItem('login_form_pass')      
    }
  }

  public getUserProfile() {
    let token = localStorage.getItem('app_token');
    if (token) {
      let payload = token.split('.')[1];
      return JSON.parse(this.b64DecodeUnicode(payload));
    }
    return {};
  }

  public getUserToken() {
    return this.getToken('app_token');
  }

  public isLoggedIn() {
    let profile = this.getUserProfile();
    if (profile.exp && (profile.exp * 1000 < Date.now() ) ) {
      //Token expired, get new token 
      let credentials = this.getLoginForm();
      if ( credentials.keepLogin === 'true' && !this.refreshingToken && this.refreshingAtemps < 1) return this.refreshToken(credentials);
      else return false;
    }
    return ((this.getToken('app_token')!=null) && (this.getToken('app_token').length > 0));
  }


  public getToken(name) {
    return localStorage.getItem(name);
  }

  public getUserId() {
    return this.jwtHelper.decodeToken(this.getToken('auth_token')).userId;
  }

  public tryGetAppData() {
    if (this.jwtHelper.decodeToken(
      localStorage.getItem('auth_token')).appData !== undefined) {
      return this.jwtHelper.decodeToken(localStorage.getItem('auth_token')).appData;
    }
    return undefined;
  }


  public getUserDetails() {
    let header = new Headers();
    header.append('Content-Type', 'application/json');
    header.append('Authorization', 'bearer ' + this.getToken('auth_token'));
    return this.http.get(this.environmentService.getEnvironment().AUTH_HOST + '/users/' + this.getUserEmail(),
      { headers: header })
      .map((res) => res.json());
  }

  public getUserEmail() {
    return this.jwtHelper.decodeToken(this.getToken('auth_token')).email;
  }

  public getOTPToken(otpCode) {
    let header = new Headers();
    header.append('Content-Type', 'application/json');
    header.append('Authorization', this.getToken('auth_token_type') + ' ' + this.getToken('auth_token'));
    return this.http.post(
      this.environmentService.getEnvironment().AUTH_HOST + '/getOtpToken', {otp: otpCode},{ headers: header })
      .timeout(15000)
      .map((response: Response) => {
        let auth = response.json();
        if (auth && auth.token) {
          localStorage.setItem('auth_token', auth.token);
          localStorage.setItem('auth_token_type', auth.token_type);
          return auth.token;
        }
      })
      .catch(err => Observable.throw(err));
  }


  public isAuthorizedAppAcess(appName: string): boolean {
    let isAuthorized = false;
    if(this.getToken('auth_token')){
     let appData = this.jwtHelper.decodeToken(this.getToken('auth_token')).appData;
     if(appData.portal.activeApps){
      isAuthorized =  appData.portal.activeApps.indexOf(appName) > -1 ? true : false;
     }
    }
    return isAuthorized;
  }

  private b64DecodeUnicode(str: string) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }
}
