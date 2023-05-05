import { ViewEncapsulation } from '@angular/compiler';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatCalendar, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { apiConstants } from 'src/app/providers/api.constants';
import { CommonAPIService } from 'src/app/providers/api.service';
import { ErrorHandlingService } from 'src/app/providers/error-handling.service';
import { EventEmitterService } from 'src/app/providers/eventEmitter.provider';
import { CustomCalendarHeaderComponent } from './custom-calendar-header/custom-calendar-header.component';

@Component({
  selector: 'calender-view',
  templateUrl: './calender-view.component.html',
  styleUrls: ['./calender-view.component.scss']
})
export class CalenderViewComponent implements OnInit {
  customHeader = CustomCalendarHeaderComponent;
  selectedDate = moment();
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  minDate: any = moment().subtract(1, 'month').startOf('month').toString();
  maxDate: any = moment().add(1, 'month').endOf('month').toString();

  apiCallActive: any = false
  reminders: any = {};
  currentMonthSubscription: any;
  constructor(private apiService: CommonAPIService, private eventEmitterService: EventEmitterService, private errorHandlingService: ErrorHandlingService) { }
  reminderDates: any = [];
  ngOnInit() {
    this.getBills()
    this.currentMonthSubscription = this.eventEmitterService.currentMonth.subscribe({
      next: (data: any) => {
        this.filterReminders(moment(data))
      }
    });
  }
  ngOnDestroy() {
    this.currentMonthSubscription?.unsubscribe()
  }
  filterReminders(date: moment.Moment = moment()) {
    this.reminders = { ... this.remindersBackup };
    this.reminderDates = [];
    Object.keys(this.reminders).forEach((type: any) => {
      this.reminders[type] = this.reminders[type].filter((reminder: any) => {
        if (moment(reminder.occurrenceDate) >= moment(date).startOf('month') && moment(reminder.occurrenceDate) <= moment(date).endOf('month')) {
          this.reminderDates.push({ type: type, date: moment(new Date(reminder.occurrenceDate)) })
          return reminder
        }
      })
    })
    if (this.calendar)
      this.calendar.updateTodaysDate();
  }

  markAsPaid($event: any, reminderId: any, type: any, index: number) {
    if (confirm("Are you sure you want to mark this bill occurrence as Paid?")) {
      this.apiCallActive = true;
      this.apiService.put(apiConstants.paidBill, { _id: reminderId }).subscribe({
        next: (data) => {
          if (data.statusCode === 200) {
            this.reminders[type][index].isPaid = true;
            this.reminders["paid"].push(this.reminders[type][index])
            this.reminders[type].splice(index, 1);
            this.getBills();
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
  remindersBackup: any = {}
  getBills() {
    this.apiCallActive = true;
    this.apiService.get(apiConstants.reminders +
      "?gte=" + moment().subtract(1, 'month').startOf('month').toISOString() +
      "&lte=" + moment().add(1, 'month').endOf('month').toISOString()).subscribe({
        next: (data) => {
          if (data.statusCode === 200) {
            this.reminders = data.response.reminders || {}
            this.remindersBackup = { ...data.response.reminders }
            this.filterReminders()
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


  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      let final = this.findDate(moment(cellDate))
      return final.length ? ('custom-date ' + final[0].type) : ''
    }
    return '';
  };
  findDate(cellDate: any) {
    return this.reminderDates.filter(({ date }: any) => {
      return date.format('D') == cellDate.format('D')
        && date.format('M') == cellDate.format('M')
        && date.format('YYYY') == cellDate.format('YYYY')
    })
  }
}
