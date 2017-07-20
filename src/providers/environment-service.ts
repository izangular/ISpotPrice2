import { Injectable } from '@angular/core';
import { Config } from '../config/config';

@Injectable()
export class EnvironmentService {
  private selectedEnvironment: any;
  public selectedEnvironmentAllowed: boolean = true;

  private defaultEnvironment: number = 0; //INT 

  constructor() {
    this.selectedEnvironment = Config.environment[this.getEnvironmentId()];
  }

  public getEnvironmentId() {
    let environmentSaved = localStorage.getItem( 'login_form_environment' );
    if (environmentSaved) {
      let env = parseInt( environmentSaved );
      if (env === undefined || env === null) {
        return this.defaultEnvironment
      }
    }
    return this.defaultEnvironment;
  }

  public setEnvironment(environmentId: number) {
    localStorage.setItem( 'login_form_environment', environmentId.toString() );
    this.selectedEnvironment = Config.environment[environmentId];
  }

  public getEnvironment() {
    return this.selectedEnvironment;
  }

}
