import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SettingsPage } from '../pages/settings/settings';
import { FaqPage } from '../pages/faq/faq';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login-page/login-page'
import { AuthService } from '../providers/auth-service';
import { TranslateService } from '@ngx-translate/core';

import { Network } from '@ionic-native/network';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage; //ybarra
  pagesLogged: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    public authService: AuthService,
    public translateService: TranslateService, 
    private network: Network,
    private toast: ToastController
    ) {
    
    this.initializeApp();
  }

  isLogged() {
    return this.authService.isLoggedIn();
  }

  logout(){
    this.authService.doLogout();
    this.nav.setRoot(LoginPage);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.translateService.addLangs(['en', 'fr', 'de', 'it']);
      this.translateService.setDefaultLang('en');

      // used for an example of ngFor and navigation
      this.pagesLogged = [
        { title: this.translateService.instant('Appraisals'), component: ListPage },
        { title: this.translateService.instant('Settings'), component: SettingsPage }
      ];

      this.startNetworkListeners();
    });
  }

  openFaq(event) {
        // That's right, we're pushing to ourselves!
    this.nav.push(FaqPage, {});
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  private startNetworkListeners() {
    //this.isOnline = true;
    //this.network.onConnect is called always even in a disconnection
    
      document.addEventListener("offline", this.onNetworkDisconnect, false);

      document.addEventListener("online", this.onNetworkConnect, false);
      
  }

  private onNetworkDisconnect(): void {
    console.log('onNetworkDisconnected');
	  //this.isOnline = false;
  }

  private onNetworkConnect(): void {
    console.log('onNetworkConnected')
    //this.isOnline = true;
  }
}
