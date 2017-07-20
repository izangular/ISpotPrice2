import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule, Http } from '@angular/http';
import { MomentModule } from 'angular2-moment';

import { MyApp } from './app.component';
import { SettingsPage } from '../pages/settings/settings';
import { FaqPage } from '../pages/faq/faq';
import { DocumentViewerPage } from '../pages/list/detail/document-viewer/document-viewer';
import { ListEvaluationPage } from '../pages/list/detail/list-evaluation/list-evaluation';
import { ListEvaluationEditorPage } from '../pages/list/detail/list-evaluation/list-evaluation-edit/list-evaluation-edit';
import { ListEvaluationEditorHistoricPage } from '../pages/list/detail/list-evaluation/list-evaluation-edit/list-evaluation-edit-historic/list-evaluation-edit-historic';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login-page/login-page';
import { LoginModal } from '../pages/login-page/login-modal/login-modal';
import { DetailPage } from '../pages/list/detail/detail';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';

import { EnvironmentService } from '../providers/environment-service'
import { AuthService } from '../providers/auth-service';
import { AmsApiService } from '../providers/api-service'
import { StylingService } from '../providers/styling-service'

import { TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { IonicStorageModule, Storage } from '@ionic/storage';

import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { MediaPlugin } from '@ionic-native/media';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Network } from '@ionic-native/network';


export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    ListPage,
    DetailPage,
    SettingsPage,
    FaqPage,
    DocumentViewerPage,
    PdfViewerComponent,
    ListEvaluationPage,
    ListEvaluationEditorPage,
    ListEvaluationEditorHistoricPage,
    LoginModal
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [Http]
            }
        }),
     IonicStorageModule.forRoot(),
     MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    ListPage,
    DetailPage,
    SettingsPage,
    FaqPage,
    DocumentViewerPage,
    ListEvaluationPage,
    ListEvaluationEditorPage,
    ListEvaluationEditorHistoricPage,
    LoginModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    EnvironmentService,
    AuthService,
    AmsApiService,
    StylingService,
    File,
    Transfer,
    Camera,
    FilePath,
    MediaPlugin,
    PhotoViewer,
    Keyboard,
    Network
  ]
})
export class AppModule {}
