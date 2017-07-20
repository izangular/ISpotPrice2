import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, ActionSheetController, ToastController, Platform, LoadingController, Loading, ModalController } from 'ionic-angular';
import { DocumentViewerPage } from './document-viewer/document-viewer';
import { ListEvaluationPage } from './list-evaluation/list-evaluation';

import { MediaPlugin } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';

import { AuthService } from '../../../providers/auth-service';
import { AmsApiService } from '../../../providers/api-service';
import { StylingService } from '../../../providers/styling-service';

import { Network } from '@ionic-native/network';

declare var cordova: any;


@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
  providers: [AmsApiService]
})
export class DetailPage {

  lastImage: string = null;
  loading: Loading;
  appraise: any;
  icons: string[];
  items: Array<{title: string, note: string, icon: string}>;
  isRecording: boolean = false;
  isRecorded: boolean = false;
  isPlaying: boolean = false;
  apiVersion: number = 2;

  mediaPlugin: MediaPlugin = null;
  recorded: boolean;
  timer: string = '00:00';  
  _pathAudioFileRaw: string;
  _pathAudioFile: string;
  _nameAudioFile: string;
  lastAudio: any;

  constructor(
              public navCtrl: NavController,
              public navParams: NavParams,
              private camera: Camera, 
              private file: File, 
              private filePath: FilePath, 
              public actionSheetCtrl: ActionSheetController, 
              public toastCtrl: ToastController, 
              public platform: Platform, 
              public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              private media: MediaPlugin,
              public authService: AuthService,
              public modalCtrl: ModalController,
              private amsApiService: AmsApiService,
              private network: Network,
              private stylingService: StylingService
              ) {    
    this.appraise = navParams.get('item');
    this.recorded = false;
    this.refreshData(null);
  }

  public refreshData(event) {
    this.refreshDocuments(event);
    this.getEvaluationData();
  }

  public presentActionSheetImage() { 
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Send from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Send from Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

    public presentActionSheetAudio() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Audio Option',
      buttons: [
        {
          text: 'Start record audio',
          handler: () => {
            this.recordAudio();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  public takePicture(sourceType) {
  // Create options for the Camera Dialog
  var options = {
    quality: 75,
    sourceType: sourceType,
    saveToPhotoAlbum: false,
    correctOrientation: true
  };
 
  // Get the data of an image
  this.camera.getPicture(options).then((imagePath) => {
    // Special handling for Android library
    if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
      this.filePath.resolveNativePath(imagePath)
        .then(filePath => {
          let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
          let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
          this.copyFileToLocalDir(correctPath, currentName, this.createFileName() )
          .then(result =>{
            if (result) {
              this.uploadMedia();
            }
          });
        });
    } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName() )
        .then(result =>{
            if (result) {
              this.uploadMedia();
            }
          });
    }
  }, (err) => {
    this.presentToast('Error while selecting image.');
    console.log(err);
  });
}

  public getUrlLocationMaps() {
    return 'https://www.google.ch/maps/place/'+this.appraise.latitude+','+this.appraise.longitude+'/@'+this.appraise.latitude+','+this.appraise.longitude+',17z';
  }

  public getUrlGoThere() {
    return 'https://maps.google.com?saddr=Current+Location&daddr='+this.appraise.latitude+','+this.appraise.longitude;
  }

  // Create a new name for the image
private createFileName() {
  var d = new Date(),
  n = d.getTime(),
  newFileName =  n + ".jpg";
  return newFileName;
}
 
// Copy the image to a local folder
private copyFileToLocalDir(namePath, currentName, newFileName): Promise<boolean> {
  return this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
    this.lastImage = newFileName;
    return true;
  }, error => {
    this.presentToast('Error while storing file.');
    console.log(error);
    return false;
  });
}
 
private presentToast(text) {
  let toast = this.toastCtrl.create({
    message: text,
    duration: 3000,
    position: 'top'
  });
  toast.present();
}
 
// Always get the accurate path to your apps folder
public pathForImage(img) {
  if (img === null) {
    return '';
  } else {
    return cordova.file.dataDirectory + img;
  }
}

public uploadMedia() {
  console.log('Uploading..');
  let targetPath, filename, documentType, fileMime;

    if ( this.isPictureUpload() ) {
      targetPath = this.pathForImage(this.lastImage);
      filename = this.lastImage;
      documentType = 'RP'
      fileMime = "image/jpeg";
    }
    else {
      targetPath = this._pathAudioFileRaw;
      filename = this._nameAudioFile;
      documentType = 'SN';
      fileMime = "audio/wav";
    }
    let uploadingDocuments = this.loadingCtrl.create({ content: 'Uploading documents ...' });
    uploadingDocuments.present();

  this.amsApiService.uploadMedia(this.appraise.id, {'targetPath':targetPath, 'filename':filename, 'documentType': documentType, 'fileMime': fileMime} )
    .then(
      (data) => {
        uploadingDocuments.dismiss();
        this.presentToast('Media succesful uploaded.');
        if (!this.isPictureUpload()) this.isRecorded = !this.isRecorded;
        this.refreshDocuments(null);
      })
    .catch((err) =>{
      uploadingDocuments.dismiss()
      this.presentToast('Error while uploading file.');
    });
}

public isPictureUpload() {
  return this.lastImage;
}

public reset() {
  this.lastAudio = null;
  this.lastImage = null;
  this.isRecorded = false;
  this.isRecording = false;
  this.isPlaying = false;
}

public recordAudio() {
  this._nameAudioFile = (new Date() ).getTime()+'.wav';
  this._pathAudioFile = this.file.tempDirectory.replace(/^file:\/\//, '') + this._nameAudioFile;
  this._pathAudioFileRaw = this.file.tempDirectory+ this._nameAudioFile;
  console.log('File Name....'+this._nameAudioFile);
  this.file.createFile(this.file.tempDirectory, this._nameAudioFile, true)
    .then(() => {
    this.lastAudio = this.media.create(this._pathAudioFile, this.onAudioStatusUpdate, this.onAudioSuccess, this.onAudioError);
    this.isRecording = !this.isRecording;
    this.lastAudio.startRecord();
    })
    .catch( (err)=> {
      this.presentToast('Error recording : '+err.message);
      console.log(err);
    })
}

private stopAudio() {
      console.log('Stoping audio...');
      this.isRecording = !this.isRecording;
      this.isRecorded = !this.isRecorded;
      this.lastAudio.stopRecord();
}

private playAudio() {
      console.log('Playing audio...');
      this.isPlaying = !this.isPlaying;
      this.lastAudio.play();

      console.log(this.isRecorded);
      console.log(this.isRecording);
      console.log(this.isPlaying);
}

private uploadAudio() {
      console.log('Uploading audio...');
      this.lastImage = null;
      this.uploadMedia();
}


 showAlert(message) {
   let alert = this.alertCtrl.create({
     title: 'Error',
     subTitle: message,
     buttons: ['OK']
   });
   alert.present();
 }

getDocumentPreview(document) {
    switch (document.fileType) {
            case 'image/jpeg':   return 'assets/img/previews/jpg.jpg';
            case 'audio/wav':   return 'assets/img/previews/audio.jpg';
            case 'application/pdf':   return 'assets/img/previews/pdf.jpg';
            default: return 'assets/img/previews/default.jpg';
        }
}

  onAudioStatusUpdate = (status) => { 
    if (this.isPlaying && status == 4) {
      this.isPlaying = !this.isPlaying;
      console.log('Paused? '+this.isPlaying);
    }
    console.log(status); 
  };
  onAudioSuccess = () => console.log('Action is successful.');
  onAudioError = (error) => console.error(error.message);

  doRefresh(refresher) {
    //TODO implement getVisit to get detail data
    this.amsApiService.getVisits().subscribe(
      (data) => {
        console.log('Data leido :');
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          if(data[i].id == this.appraise.id) {
            this.appraise = data[i];
            this.refreshData(refresher);
          }
        }
      },
      (err) =>{
        this.showError(err);
        if (refresher) refresher.complete();    
      }
    );
  }

  refreshDocuments(refresher) {
    let loadingDocuments = this.loadingCtrl.create({ content: 'Getting documents data...' });
    loadingDocuments.present();
  
    this.amsApiService.getRequestDocuments(this.appraise.id).subscribe(
      (data) => {
      if (refresher) refresher.complete();
      this.appraise.documents = data;
      loadingDocuments.dismiss()
    },
    (error)=> {
      if (refresher) refresher.complete();
      this.showError('Error fetching data');
    } );
  }

  getEvaluationData() {
    let loadingRefresh = this.loadingCtrl.create({ content: 'Getting data...' });
    loadingRefresh.present();

    this.amsApiService.getAppraisalObjectData(this.appraise.id, this.apiVersion).subscribe((requestData: any) => {
        this.appraise.valuationData = requestData;

        this.amsApiService.getAppraisalObjectDataLayout(this.appraise.id, {
          'layoutName': 'intrinsic',
          'version': this.apiVersion
        }).subscribe((data) => {
          console.log(data);
          this.appraise.valuationLayout = data;
          loadingRefresh.dismiss();
        });
      });
  }

  openEvaluationList() {
    console.log("Evaluation list...");
  }

  documentTapped(event, item) {
    this.navCtrl.push(DocumentViewerPage, {
      item: item
    });
  }


  appraisalEvaluationTapped() {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(ListEvaluationPage, {
      item: this.appraise
    });
  }

  showError(text) { 
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }
}
