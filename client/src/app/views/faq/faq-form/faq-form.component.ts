import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, merge } from 'rxjs';
import { AlertService } from 'src/app/providers/alert.service';
import { apiConstants } from 'src/app/providers/api.constants';
import { CommonAPIService } from 'src/app/providers/api.service';
import { Constants } from 'src/app/providers/constant';
import { ErrorHandlingService } from 'src/app/providers/error-handling.service';
import { ErrorStateMatcherService } from 'src/app/providers/error-matcher.service';
import { Validator } from 'src/app/providers/Validator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-faq-form',
  templateUrl: './faq-form.component.html',
  styleUrls: ['./faq-form.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class FaqFormComponent implements OnInit {
  environment = environment;
  isViewOnly: any;
  faqForm: FormGroup;
  apiCallActive: boolean = false;
  questionMaxLength: number = 1000;
  answerMaxLength: number = 2500;
  faqList: any = [];
  selectedFaqCategory: any;
  selectedFaqDetails: any = {}
  constructor(
    public matDialog: MatDialogRef<FaqFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: CommonAPIService,
    private errorHandlingService: ErrorHandlingService,
    public matcher: ErrorStateMatcherService,
    private fb: FormBuilder,
    private alertService: AlertService, private http: HttpClient
  ) {
    this.isViewOnly = data.isViewOnly;
    this.selectedFaqCategory = data.selectedFaqCategory;
    this.selectedFaqDetails = data;
    this.selectedAnswerType = data.type || '1'
    this.faqForm = this.fb.group({
      faqs: this.fb.array([]),
    });

    this.faqs.push(
      this.fb.group({
        categoryId: [this.selectedFaqCategory],
        question: [data.question || ''],
        type: [data.type || '1'],
        answer: [data.answer || ''],
        audioLink: [data.audioLink ? data.audioLink : ''],
        videoLink: [data.videoLink ? data.videoLink : ''],
        youtubeLink: [data.youtubeLink || '']
      })
    );
    this.answerTypeUpdated(data.type || '1')
    this.faqList.push({ id: 'faq' + this.faqList.length + 1 });
    if (!data.isViewOnly) {
      this.faqs['controls'][0]['controls']['question'].setValidators(
        Validators.required
      );
    }
    this.faqs.controls[0].controls['type'].valueChanges.subscribe({
      next: (value: any) => {
        this.answerTypeUpdated(value)
      }
    })

  }
  answerTypeUpdated(value: any) {
    this.selectedAnswerType = value
    switch (value) {
      case '1':
        this.selectedFileSettings = {}
        this.setValidators('answer', [Validators.required]);
        break;
      case '2':
        this.selectedFileSettings = {}
        this.setValidators('youtubeLink', [Validators.required, Validators.pattern(Constants.youtubeRegex)])
        break;
      case '3':
        this.selectedFileSettings = this.fileSettings[0]
        this.setValidators('videoLink', [Validators.required])
        break;
      case '4':
        this.selectedFileSettings = this.fileSettings[1]
        this.setValidators('audioLink', [Validators.required])
        break;
      default:
        console.log("default")
        break;
    }
  }
  getReadableLink(url: any) {
    let readableLink = url.split('/'); // prod
    // let readableLink = url.split('\\'); // local
    readableLink.shift();
    return readableLink.join('/')
  }
  setValidators(key: any, validators: any) {
    this.faqs['controls'][0]['controls'][key].setValidators(validators);
    this.faqs['controls'][0]['controls'][key].updateValueAndValidity()
    this.clearOthers(key);
  }
  answerTypes = ['answer', 'audioLink',
    'videoLink',
    'youtubeLink'];
  clearOthers(key: any) {

    if (this.selectedFaqDetails[key]) {
      this.faqs['controls'][0]['controls'][key].setValue(this.selectedFaqDetails[key]);
      this.faqs['controls'][0]['controls'][key].updateValueAndValidity()
    }
    this.answerTypes.forEach(type => {
      if (key != type) {
        this.fileObject = {};
        this.uploadingInProgess = false;
        this.uploadingProgress = 0;
        this.attachment = null;
        this.faqs['controls'][0]['controls'][type].setValue('');
        this.faqs['controls'][0]['controls'][type].setValidators([]);
        this.faqs['controls'][0]['controls'][type].updateValueAndValidity()
      }
    })
  };
  selectedAnswerType: any = 1
  selectedFileSettings: any = {}
  fileSettings: any = [
    {
      type: '1',
      name: 'video',
      maxSize: 200, //200MB
      mimeTypes: 'video/mp4,video/webm,video/ogg',
      extensions: ['mp4', 'ogg', 'webm'],
      fileType: 'MP4, WebM or OGG',
      key: 'videoLink'
    },
    {
      type: '2',
      name: 'audio',
      maxSize: 200, //200MB
      mimeTypes: 'audio/mpeg,audio/ogg,audio/wav',
      extensions: ['mp3', 'ogg', 'wav'],
      fileType: 'MP3, OGG or WAV',
      key: 'audioLink'
    }
  ]
  get faqs(): any {
    return this.faqForm.get('faqs') as FormArray;
  }
  addFaq(): void {
    this.faqList.push({ id: 'faq' + this.faqList.length + 1 });
    this.faqs.push(
      this.fb.group({
        categoryId: [this.selectedFaqCategory],
        question: ['', [Validators.required]],
        answer: ['', Validators.required],
      })
    );
  }
  removeFaq(index: number): void {
    this.faqs.removeAt(index);
    this.faqList.splice(index, 1);
  }

  ngOnInit(): void { }
  saveFaqs(): void {
    this.apiCallActive = true;
    if (this.faqForm.valid) {
      let payload: any = [
        ...this.faqForm.value.faqs,
      ];
      if (this.selectedFaqDetails?._id) {
        payload[0]["_id"] = this.selectedFaqDetails._id;
      }
      this.apiService.post(apiConstants.createFaq, payload).subscribe({
        next: (data: any) => {
          if (data && (data.statusCode === 200 || data.statusCode === 201)) {
            this.alertService.notify(data.message);
            this.matDialog.close(data);
          } else {
            this.errorHandlingService.handle(data);
          }
        },
        error: (error) => {
          this.errorHandlingService.handle(error);
        },
        complete: () => {
          this.apiCallActive = false;
        }
      });
    }
  }

  fileObject: any = {};
  uploadingInProgess: boolean = false;
  uploadingProgress: any;
  attachment: any = null;
  uploadFiles($event: any): void {
    if ($event.target.value) {
      const file = $event.target.files[0];
      this.fileObject.fileName = file.name;
      this.fileObject.fileExtension = file.name.split('.')[file.name.split('.').length - 1].toLowerCase();
      this.fileObject.fileSize = file.size;
      const allowedFileExtentions = this.selectedFileSettings.extensions;
      if (!allowedFileExtentions.find((format: any) => format === this.fileObject.fileExtension)) {
        this.alertService.notify('Please make sure your file is in one of these formats: ' + allowedFileExtentions);
      } else if (this.fileObject.fileSize > (this.selectedFileSettings.maxSize * 1000000)) {
        this.alertService.notify(`Please make sure your file is less than ${this.selectedFileSettings.maxSize} MB in size.`);
      } else {
        const formData = new FormData();
        formData.append(this.selectedAnswerType == '3' ? 'video' : 'audio', file);
        this.uploadFile(formData);
      }
    }
  }

  uploadFile(formData: any): any {
    this.uploadingInProgess = true;
    this.apiCallActive = true;
    this.attachment = null
    this.fileObject = {};
    this.uploadingProgress = 0;
    this.http
      .post(environment.baseUrl + apiConstants.upload + '-' + this.selectedFileSettings.name, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event: any) => {
          switch (event.type) {
            case HttpEventType.Sent:
              break;
            case HttpEventType.ResponseHeader:
              this.uploadingInProgess = false;
              this.apiCallActive = false;
              break;
            case HttpEventType.UploadProgress:
              this.uploadingProgress = Math.round(
                (event.loaded / event.total) * 100
              );
              break;
            case HttpEventType.Response:
              this.apiCallActive = false;
              if (event.body.statusCode === 200) {
                const file = event.body.data;
                this.attachment = {
                  coverFileName: file.filename,
                  coverFolderName: file.fieldname,
                  coverPath: file.path,
                };
                this.faqs['controls'][0]['controls'][this.selectedAnswerType == '3' ? 'videoLink' : 'audioLink'].setValue(this.getReadableLink(this.attachment.coverPath))
              } else {
                this.errorHandlingService.handle(event.body);
              }
              setTimeout(() => {
                this.uploadingProgress = 0;
              }, 500);
          }
        })
      )
      .subscribe();
  }
  formatBytes(bytes: any, decimals = 2): any {
    if (bytes === 0) { return '0 Bytes'; }
    const k = 1024,
      dm = decimals <= 0 ? 0 : decimals || 2,
      sizes = ['Bytes', 'KB', 'MB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return '(' + parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i] + ')';
  }
}
