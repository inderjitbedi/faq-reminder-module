import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemindersListComponent } from './reminders-list/reminders-list.component';
import { RouterModule } from '@angular/router';
import { CalenderViewComponent } from './calender-view/calender-view.component';
import { MaterialModule } from 'src/app/material/material.module';
import { BillsListComponent } from './bills-list/bills-list.component';
import { BillsFormComponent } from './bills-form/bills-form.component';
import { CustomCalendarHeaderComponent } from './calender-view/custom-calendar-header/custom-calendar-header.component';


const routes = [
  { path: 'list', component: RemindersListComponent },
  { path: 'bills-list', component: BillsListComponent },
  { path: '**', redirectTo: 'list' },
];


@NgModule({
  declarations: [RemindersListComponent,  CalenderViewComponent, BillsListComponent, BillsFormComponent, CustomCalendarHeaderComponent],
  imports: [RouterModule.forChild(routes), CommonModule,MaterialModule],
})
export class RemindersModule { }
