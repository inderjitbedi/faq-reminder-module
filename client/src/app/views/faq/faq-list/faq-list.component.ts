import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { apiConstants } from 'src/app/providers/api.constants';
import { CommonAPIService } from 'src/app/providers/api.service';
import { ErrorHandlingService } from 'src/app/providers/error-handling.service';

import { MatDialog } from '@angular/material/dialog';
import { FaqFormComponent } from '../faq-form/faq-form.component';
import { AlertService } from 'src/app/providers/alert.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient, HttpEventType } from '@angular/common/http';
// import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
// import { Constants } from 'src/app/providers/constant';

@Component({
  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.scss'],
})
export class FaqListComponent implements OnInit {
  addUserDialogRef: any;
  displayedColumns: string[];
  dataSource: any;
  apiCallActive : boolean = true;
  selectedFaqCategory: any;
  constructor(
    private apiService: CommonAPIService,
    public dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService,
    private alertService: AlertService,
    private clipboard: Clipboard, private activeRoute: ActivatedRoute
  ) {
    this.displayedColumns = ['id', 'question', 'action'];

    this.activeRoute.params.subscribe({
      next: (route) => {
        this.selectedFaqCategory = route['id'];
        this.getFaqs();
      }
    })
  }
  ngOnInit(): void {

  }

  openFaqForm(isViewOnly: boolean, faqData: any = {}): void {
    this.addUserDialogRef = this.dialog.open(FaqFormComponent, {
      minWidth: '320px',
      width: '585px',
      disableClose: true,
      data: { isViewOnly, ...faqData,selectedFaqCategory:this.selectedFaqCategory },
    });
    this.addUserDialogRef.afterClosed().subscribe({
      next: (data: any) => {
        if (data) {
          this.getFaqs();
        }
      },
    });
  }
  selectedFaqCategoryDoc :any;
  getFaqs() {

    this.apiCallActive  = true;
    this.apiService.get(apiConstants.faq + this.selectedFaqCategory).subscribe({
      next: (data) => {
        this.apiCallActive  = false;
        if (data.statusCode === 200) {
          this.dataSource = new MatTableDataSource<any>(data.response?.faqs||[]);
          this.selectedFaqCategoryDoc = data.response?.category || {};
        } else {
          this.errorHandlingService.handle(data);
        }
      },
      error: (e) => {
        this.apiCallActive  = false;
        this.errorHandlingService.handle(e);
      },
    });
  }
  deleteFaq(index: number, faq: any) {
    if (window.confirm('Are you sure you want to delete this?')) {
      this.apiService.put(apiConstants.deleteFaq, { id: faq._id }).subscribe({
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
  copyText() {
    this.clipboard.copy(
      `<iframe width="100%" height="1000px" src="${environment.baseUrl}faq-snippet.html?category=${this.selectedFaqCategory}"></iframe>`
    );
    this.alertService.notify('IFrame snippet copied!');
  }

}
