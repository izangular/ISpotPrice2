import { NavParams} from 'ionic-angular';
import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'login-modal',
  templateUrl: 'login-modal.html'
})
export class LoginModal {
  public userData :any = {};
  public validationCode : string = null;
  public validationChannel: string = '';

 constructor(
              public params: NavParams,
              public viewCtrl: ViewController) {
   this.userData = params.get('UserObject');
   if (this.userData.userAuthMethod === 2) this.validationChannel = 'E-mail'
   if (this.userData.userAuthMethod === 3) this.validationChannel = 'SMS'
 }

 public dismiss() {
     this.viewCtrl.dismiss();
 }


 public save() {
    this.viewCtrl.dismiss(this.validationCode);
 }


}