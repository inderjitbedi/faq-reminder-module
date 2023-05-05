import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from 'src/app/providers/alert.service';
import { apiConstants } from 'src/app/providers/api.constants';
import { CommonAPIService } from 'src/app/providers/api.service';
import { ErrorHandlingService } from 'src/app/providers/error-handling.service';
import { ErrorStateMatcherService } from 'src/app/providers/error-matcher.service';
import { debounceTime, map } from "rxjs/operators";
import { Constants } from 'src/app/providers/constant';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
  selector: 'app-bills-form',
  templateUrl: './bills-form.component.html',
  styleUrls: ['./bills-form.component.scss']
})
export class BillsFormComponent implements OnInit {

  @ViewChild('picker') picker: any;

  billForm: FormGroup;

  nameMaxLength: number = 50;
  apiCallActive: boolean = false;
  isViewOnly: boolean = false;
  createPaymentMethod: boolean = false;
  createBillCategory: boolean = false;
  isRepeatedOccurrence: boolean = false;
  occurrences: any;
  selectedBill: any;
  constructor(public matDialog: MatDialogRef<BillsFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: CommonAPIService, private errorHandlingService: ErrorHandlingService,
    public matcher: ErrorStateMatcherService, private fb: FormBuilder,
    private alertService: AlertService, private http: HttpClient) {
    this.getBillCategories();
    this.getPaymentMethods();
    this.occurrences = [
      { name: "Daily", value: "1" },
      { name: "Weekly", value: "7" },
      // { name: "Biweekly", value: "14" },
      { name: "Monthly", value: "30" },
      { name: "Every 3 months", value: "90" },
      { name: "Every 6 months", value: "180" },
      { name: "Yearly", value: "360" }, // why 360, just for the calculation sake
    ];
    this.isRepeatedOccurrence = !!data.repeatsAfter;

    //ADD REQUIRED 
    this.billForm = this.fb.group({
      name: [data.name || '', Validators.required],
      amount: [data.amount || '', [Validators.required, Validators.pattern('^\[0-9]+(\.[0-9]+)?$')]],
      paymentMethodId: [data?.paymentMethodId?._id || '', Validators.required],
      paymentMethodName: ['', [Validators.pattern('^[a-zA-Z0-9 \s]*$')]],
      billCategoryId: [data?.billCategoryId?._id || '', Validators.required],
      billCategoryName: ['', [Validators.pattern('^[a-zA-Z0-9 \s]*$')]],
      note: [data.note || '', Validators.required],
      memo: [data.memo || '', Validators.required],
      payee: [data.payee || '', Validators.required],
      isAutopay: [data.isAutopay || false],
      occurrence: [data.repeatsAfter ? 'repeating' : '0'],
      repeatedOccurrence: [data.repeatsAfter ? data.repeatsAfter + '' : ''],
      startDate: [data.startDate || '', Validators.required],
    });

    this.selectedBill = data._id || null;
    this.billForm.controls['paymentMethodId'].valueChanges.subscribe({
      next: (value) => {
        if (value) {
          this.createPaymentMethod = value == 'add_new';
          let validators = null;
          if (value == 'add_new') {
            validators = [Validators.required, Validators.pattern('^[a-zA-Z0-9 \s]*$')]
          }
          this.billForm['controls']['paymentMethodName'].setValidators(validators);
          this.billForm['controls']['paymentMethodName'].updateValueAndValidity()
        }
      }
    })
    this.billForm.controls['paymentMethodName'].valueChanges.pipe(debounceTime(500)).subscribe({
      next: (value) => {
        this.checkUniqueness(apiConstants.checkPaymentMethodUniqueness, 'paymentMethodName')
      }
    })
    this.billForm.controls['billCategoryId'].valueChanges.subscribe({
      next: (value) => {
        if (value) {
          this.createBillCategory = value == 'add_new';
          let validators = null;
          if (value == 'add_new') {
            validators = [Validators.required, Validators.pattern('^[a-zA-Z0-9 \s]*$')]
          }
          this.billForm['controls']['billCategoryName'].setValidators(validators);
          this.billForm['controls']['billCategoryName'].updateValueAndValidity()
        }
      }
    })
    this.billForm.controls['billCategoryName'].valueChanges.pipe(debounceTime(500)).subscribe({
      next: (value) => {
        this.checkUniqueness(apiConstants.checkBillCategoryUniqueness, 'billCategoryName')
      }
    })
    this.billForm.controls['occurrence'].valueChanges.subscribe({
      next: (value) => {
        if (value) {
          this.isRepeatedOccurrence = value == 'repeating';
          let validators = [];
          if (this.isRepeatedOccurrence) {
            this.billForm['controls']['repeatedOccurrence'].setValue('')
            validators.push(Validators.required)
          }
          this.billForm['controls']['repeatedOccurrence'].setValidators(validators);
          this.billForm['controls']['repeatedOccurrence'].updateValueAndValidity()
        }
      }
    })
    if (this.selectedBill) {
      this.minDateForStartDate = moment(data.startDate)
    }
    console.log(" this.billForm =", this.billForm)
  }
  minDateForStartDate: moment.Moment = moment();
  minDateFilter = (d: Date | null): boolean => {
    return moment(d).endOf('day') >= this.minDateForStartDate;
  };
  checkUniqueness(apiUrl: any, controlName: any) {
    let formControl = this.billForm['controls'][controlName];
    if (formControl.valid && formControl.value.trim()) { // && formControl.value.trim() != this.categoryName
      this.apiCallActive = true;
      this.apiService.get(apiUrl + formControl.value.trim().toLowerCase()).subscribe({
        next: (data) => {
          if (data.isUnique === false) {
            formControl.setErrors({ 'not_unique': true });
          } else {
            if (this.billForm.controls[controlName].errors) {
              formControl.setErrors({ ...this.billForm.controls[controlName].errors, 'not_unique': null });
            }
          }
        },
        error: (e) => {
          this.errorHandlingService.handle(e);
        },
        complete: () => {
          this.apiCallActive = false;
        }
      });
    }
  }
  clicked($event: any) {
    $event.stopPropagation()
  }
  ngOnInit(): void {
  }
  paymentMethods: any = []
  getPaymentMethods() {
    this.apiCallActive = true;
    this.apiService.get(apiConstants.paymentMethods).subscribe({
      next: (data) => {
        this.apiCallActive = false;
        if (data.statusCode === 200) {
          this.paymentMethods = data.response || []
        } else {
          this.errorHandlingService.handle(data);
        }
      },
      error: (e) => {
        this.apiCallActive = false;
        this.errorHandlingService.handle(e);
      },
    });
  }
  billCategories: any = [];
  getBillCategories() {
    this.apiCallActive = true;
    this.apiService.get(apiConstants.billCategories).subscribe({
      next: (data) => {
        this.apiCallActive = false;
        if (data.statusCode === 200) {
          this.billCategories = data.response || []
        } else {
          this.errorHandlingService.handle(data);
        }
      },
      error: (e) => {
        this.apiCallActive = false;
        this.errorHandlingService.handle(e);
      },
    });
  }

  saveBill() {
    this.apiCallActive = true;
    if (this.billForm.valid) {
      const payload = {
        ...this.billForm.value,
      };
      if (payload.paymentMethodName) { delete payload.paymentMethodId; payload.paymentMethodName = payload.paymentMethodName.toLowerCase() }
      if (payload.billCategoryName) { delete payload.billCategoryId; payload.billCategoryName = payload.billCategoryName.toLowerCase() }

      if (payload.occurrence == "0") {
        payload.repeatsAfter = 0
      } else {
        payload.repeatsAfter = payload.repeatedOccurrence
      }
      delete payload.occurrence
      delete payload.repeatedOccurrence
      if (this.selectedBill) {
        payload._id = this.selectedBill
      }
      this.apiService.post(apiConstants.createBill, payload).subscribe({
        next: (data: any) => {
          this.apiCallActive = false;
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
      });
    }
  }
}
