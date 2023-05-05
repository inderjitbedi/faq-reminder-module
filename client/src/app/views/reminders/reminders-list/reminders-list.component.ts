import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { Moment } from 'moment';
import { apiConstants } from 'src/app/providers/api.constants';
import { CommonAPIService } from 'src/app/providers/api.service';
import { ErrorHandlingService } from 'src/app/providers/error-handling.service';
import { BillsFormComponent } from '../bills-form/bills-form.component';
import { BillsListComponent } from '../bills-list/bills-list.component';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.scss']
})
export class RemindersListComponent implements OnInit {
  selectedTab: number = 0;
  nextMonthDate: any = moment().add(30, 'days');
  constructor(public dialog: MatDialog, private apiService: CommonAPIService, private errorHandlingService: ErrorHandlingService) { }

  ngOnInit(): void {
    this.getBills()
  }
  saveBillDialogRef: any;

  @ViewChild(BillsListComponent) billList!: BillsListComponent;

  openBillForm() {

    this.saveBillDialogRef = this.dialog.open(BillsFormComponent, {
      minWidth: '320px',
      width: '685px',
      disableClose: true,
      data: {},
    });
    this.saveBillDialogRef.afterClosed().subscribe({
      next: (data: any) => {
        if (data) {
          this.selectedTab = 2;
          this.billList?.getBills()
        }
      },
    });
  }


  apiCallActive: any = false
  reminders: any = {};
  amountDue: any = 0;
  getBills() {
    this.apiCallActive = true;
    this.apiService.get(apiConstants.reminders).subscribe({
      next: (data) => {
        if (data.statusCode === 200) {
          this.reminders = data.response.reminders || {}
          this.amountDue = data.response.amountDue || 0
        } else {
          this.errorHandlingService.handle(data);
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
  markAsPaid($event: any, reminderId: any, type: any, index: number) {
    if (confirm("Are you sure you want to mark this bill occurrence as Paid?")) {
      this.apiCallActive = true;
      this.apiService.put(apiConstants.paidBill, { _id: reminderId }).subscribe({
        next: (data) => {
          if (data.statusCode === 200) {
            this.reminders[type][index].isPaid = true;
            this.reminders["paid"].push(this.reminders[type][index])
            this.reminders[type].splice(index, 1)
            this.getBills()
          } else {
            this.errorHandlingService.handle(data);
          }
        },
        error: (e) => {
          this.errorHandlingService.handle(e);
        },
        complete: () => {
          this.apiCallActive = false;
          $event.preventDefault()
        }
      });
    } else {
      $event.preventDefault()
    }
  }

  // createOccurrences(){
  //   this.apiService.get(apiConstants.createOccurrences).subscribe({
  //     next: (data) => {
  //       if (data.statusCode === 200) {
        
  //       } else {
  //         this.errorHandlingService.handle(data);
  //       }
  //     },
  //     error: (e) => {
  //       this.errorHandlingService.handle(e);
  //     },
  //     complete: () => {
  //       this.apiCallActive = false;
  //     }
  //   });
  // }
  tabChanged(event: any) {
    this.selectedTab = event
    if (event < 2) {
      this.getBills()
    }
  }
}
