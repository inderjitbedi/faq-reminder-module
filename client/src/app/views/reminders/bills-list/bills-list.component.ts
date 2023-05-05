import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { AlertService } from 'src/app/providers/alert.service';
import { apiConstants } from 'src/app/providers/api.constants';
import { CommonAPIService } from 'src/app/providers/api.service';
import { ErrorHandlingService } from 'src/app/providers/error-handling.service';
import { BillsFormComponent } from '../bills-form/bills-form.component';

@Component({
  selector: 'app-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.scss']
})
export class BillsListComponent implements OnInit {

  constructor(
    private apiService: CommonAPIService,
    public dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService,
    private alertService: AlertService,) {
    this.displayedColumns = ['id', 'name', 'billCategoryId', 'payee', 'paymentMethodId','startDate', 'amount', 'action'];
  }

  ngOnInit(): void {
    this.getBills()
  }

  saveBillDialogRef: any;

  displayedColumns: string[];
  dataSource: any;
  apiCallActive: boolean = true;
  openBillForm(data: any, isViewOnly: boolean) {

    this.saveBillDialogRef = this.dialog.open(BillsFormComponent, {
      minWidth: '320px',
      width: '685px',
      disableClose: true,
      data: {
        ...data,
        isViewOnly: isViewOnly
      },
    });
    this.saveBillDialogRef.afterClosed().subscribe({
      next: (data: any) => {
        if (data) {
          this.getBills()
        }
      },
    });
  }

  getBills() {

    this.apiCallActive = true;
    this.apiService.get(apiConstants.getBills).subscribe({
      next: (data) => {
        if (data.statusCode === 200) {
          this.dataSource = new MatTableDataSource<any>(data.response || []);
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
  deleteBill(index: number, bill: any) {
    if (window.confirm('Are you sure you want to delete this bill and all the related occurrences?')) {
      this.apiService.put(apiConstants.deleteBill, { _id: bill._id }).subscribe({
        next: (data) => {
          if (data.statusCode === 201 || data.statusCode === 200) {
            const srcData = this.dataSource.data;
            srcData.splice(index, 1);
            this.dataSource.data = srcData;
            this.alertService.notify(data.message);
          } else {
            this.errorHandlingService.handle(data);
          }
        },
        error: (e) => this.errorHandlingService.handle(e),
      });
    }
  }
}
