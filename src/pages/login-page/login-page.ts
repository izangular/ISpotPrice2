import { ListPage } from '../list/list';

import { Component } from '@angular/core';
import { IonicPage, AlertController, LoadingController, NavController, NavParams, Loading, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AuthService } from '../../providers/auth-service';
import { StylingService } from '../../providers/styling-service';
import { EnvironmentService } from '../../providers/environment-service';

import { LoginModal } from './login-modal/login-modal';

import { Network } from '@ionic-native/network';

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login-page',
  templateUrl: 'login-page.html',
})
export class LoginPage {
    public loading: Loading;
    public environmentId: number;
    public registerCredentials = { userEmail: '', userPwd: '', app: 'portal', culture: 'en', keepLogin: false };

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private authService: AuthService,
    private environmentService: EnvironmentService,
    private alertCtrl: AlertController, 
    private loadingCtrl: LoadingController,
    private storage: Storage,
    private network: Network,
    private stylingService: StylingService,
    public modalCtrl: ModalController
    ) {
  }

  ionViewDidLoad() {
    this.environmentId = this.environmentService.getEnvironmentId();
    if(this.authService.isLoggedIn()){ 
        this.navCtrl.setRoot(ListPage);
    }
  }

  login() {
    if (!this.network ||this.network.type === 'none') {
      this.showError('No network connection');
    }
    else {
      this.showLoading();
      this.authService.loginPortal(this.registerCredentials).subscribe(
          portalToken => {
          if (!portalToken) return this.showError("Access Denied : Unknown");
          if (this.authService.getToken('token_type') === 'inactive') return this.showError("Access Denied : Inactive account");

          //Check 2level auth
          this.authService.getUserDetails().
              subscribe(
              (userData) => {
                if (userData.userActivationStatus === 1
                    && userData.userAuthMethod > 1 ) {
                      //2level auth
                      if (this.loading) this.loading.dismiss();
                      this.presentActivationModal(userData, portalToken);
                }else {
                  this.loginApp(portalToken);
              }
            });
      },
        error => {
          this.showError("Access Denied");
        });
    }
  }


  private loginApp(portalToken) {
    this.authService.loginApp(portalToken, 'ams').subscribe(
      (result) => {
        // Give the man a chance to save the token...
        this.navCtrl.setRoot(ListPage);
        return result;
      },
      (err) => {
        console.log(err);
        this.showError("Access Denied");
        return false;
      }
    );
  }


  getRecoverPasswordUrl() {
    return this.environmentService.getEnvironment().PORTAL_HOST +'/#/forgotpassword';
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  showError(text) {
    if (this.loading) this.loading.dismiss();
 
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }

  onSelectChange(value) {
    if (value >= 0 && value <=4 ) {
      this.environmentId = value;
      this.environmentService.setEnvironment(value);
    }
  }

  presentActivationModal(userData, portalToken) {
   let activationModal = this.modalCtrl.create(LoginModal, { UserObject: userData });
    activationModal.onDidDismiss(code => {
     if (code) {
      this.authService.getOTPToken(code).subscribe(
        (portalToken) => {
          if (portalToken) {
            this.loginApp(portalToken);
          }
        },
        (error) => {
          this.showError(error)
        });
     }
    if (!code && this.loading) this.loading.dismiss();
   });
   activationModal.present();

 }

}


