import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/providers/alert.service';
import { apiConstants } from 'src/app/providers/api.constants';
import { CommonAPIService } from 'src/app/providers/api.service';
import { Constants } from 'src/app/providers/constant';
import { ErrorHandlingService } from 'src/app/providers/error-handling.service';
import { FaqCategoryFormComponent } from '../faq-category-form/faq-category-form.component';

@Component({
  selector: 'app-faq-categories',
  templateUrl: './faq-categories.component.html',
  styleUrls: ['./faq-categories.component.scss']
})
export class FaqCategoriesComponent implements OnInit {

  addUserDialogRef: any;
  displayedColumns: string[];
  dataSource: any;
  apiCallActive: boolean = true;

  constructor(
    private apiService: CommonAPIService,
    public dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService,
    private alertService: AlertService, public router: Router
  ) {
    this.displayedColumns = ['id', 'name', 'action'];
  }
  ngOnInit(): void {
    this.getFaqCategories();
  }

  openFaqCategoryForm(isViewOnly: boolean, faqData: any = {}): void {
    this.addUserDialogRef = this.dialog.open(FaqCategoryFormComponent, {
      minWidth: '320px',
      width: '585px',
      disableClose: true,
      data: { isViewOnly, ...faqData },
    });
    this.addUserDialogRef.afterClosed().subscribe({
      next: (data: any) => {
        if (data) {
          this.getFaqCategories();
        }
      },
    });
  }
  getFaqCategories() {
    this.apiCallActive = true;
    this.apiService.get(apiConstants.faqCategory).subscribe({
      next: (data) => {
        this.apiCallActive = false;
        if (data.statusCode === 200) {
          this.dataSource = new MatTableDataSource<any>(data.response);
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
  deleteFaqCategory(index: number, faq: any) {
    if (window.confirm('Are you sure you want to delete this?')) {
      this.apiService.put(apiConstants.deleteFaqCategory, { id: faq._id }).subscribe({
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
  getFaqlist(row: any) {
    this.router.navigate([Constants.Pages.FAQ_LIST, row._id])
  }
  editFaqCategory(element:any){
    this.openFaqCategoryForm(false,element)
  }
}
