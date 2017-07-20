import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, AlertController } from 'ionic-angular';
import { MediaPlugin, MediaObject } from '@ionic-native/media';

import { File } from '@ionic-native/file';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';

import { AmsApiService } from '../../../../providers/api-service';
import { StylingService } from '../../../../providers/styling-service';

import { Network } from '@ionic-native/network';

@Component({
  selector: 'page-document-viewer',
  templateUrl: 'document-viewer.html',
  providers: [AmsApiService]
})
export class DocumentViewerPage {
  document: any;
  loading: Loading;
  loadedDocument: boolean = false;
  isPlaying: boolean = false;
  lastAudio: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private file: File,
    public loadingCtrl: LoadingController,
    private amsApiService: AmsApiService,
    public alertCtrl: AlertController,
    private media: MediaPlugin,
    private photoViewer: PhotoViewer,
    private network: Network,
    private stylingService: StylingService
  ) 
    {
      this.loading = this.loadingCtrl.create();
      this.document = navParams.get('item');
      this.isDocumentDownloaded();
  }


    downloadDocument(document) {
      this.loading.setContent('Downloading...');
      this.loading.present();
      this.amsApiService.downloadDocument(document.id).subscribe(
      (data) => {
      this.file.writeFile(
        this.file.tempDirectory,
        document.fileName,
        data,
        {replace: true}
      ).then(
        succeed => {
          console.log("write complete:");
          this.loading.dismissAll();
          this.loadedDocument = true;
      }
      ).catch(
        err => {
          console.log("file create failed:",err);
          this.showError(err);
        }
      );
      },
      (err) =>{
        console.log(err);
        this.showError(err);
      }
    );
  }

  isDocumentDownloaded() {
    this.file.checkFile(this.file.tempDirectory, this.document.fileName)
    .then( 
        (success)=> {
        this.loadedDocument = true;
        
      }, 
      (error) => {
        this.downloadDocument(this.document);
      });
  }

  showError(text) {
    this.loading.dismiss();
 
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }

  getDocumentLocalUrl() {
    return this.file.tempDirectory + this.document.fileName;
  }

  isDocumentImage() {
    if (this.document.fileType.indexOf('image') >= 0 ) return true;
    return false;
  }

  isDocumentPdf() {
    if (this.document.fileType.indexOf('pdf') >= 0 ) return true;
    return false;
  }

  isDocumentAudio() {
    if (this.document.fileType.indexOf('audio') >= 0 ) return true;
    return false;
  }

  private stopAudio() {
    console.log('Stoping audio...');
    this.isPlaying = false;
    this.lastAudio.stopRecord();
  }

  private playAudio() {
    console.log('Playing audio...');
    this.lastAudio = this.media.create(this.file.tempDirectory.replace(/^file:\/\//, '') + this.document.fileName, this.onAudioStatusUpdate, this.onAudioSuccess, this.onAudioError);
    this.isPlaying = true;
    this.lastAudio.play();
  }

  onAudioStatusUpdate = (status) => { 
    if (this.isPlaying && status == 4) { this.stopAudio(); }
  };
  onAudioSuccess = () => console.log('Action is successful.');
  onAudioError = (error) => console.error(error.message);
}
