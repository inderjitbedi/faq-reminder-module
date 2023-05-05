import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';
import { Subject, takeUntil } from 'rxjs';
import { EventEmitterService } from 'src/app/providers/eventEmitter.provider';

@Component({
  selector: 'custom-header',
  templateUrl: './custom-calendar-header.component.html',
  styleUrls: ['./custom-calendar-header.component.scss']
})
export class CustomCalendarHeaderComponent<D> implements OnDestroy {
  private _destroyed = new Subject<void>();
  // @Output() getCurrentDate = new EventEmitter<any>();

  constructor(
    private _calendar: MatCalendar<D>,
    private _dateAdapter: DateAdapter<D>, private eventEmitterService: EventEmitterService,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
    cdr: ChangeDetectorRef,
  ) {
    _calendar.stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  get periodLabel() {
    return this._dateAdapter
      .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
      .toLocaleUpperCase();
  }
  monthView: any = 0;
  disableButton: any = "";
  changeMonth(counter: any) {
    this.monthView += counter;
    if (this.monthView >= -1 && this.monthView <= 1) {
      this._calendar.activeDate = this._dateAdapter.addCalendarMonths(this._calendar.activeDate, counter)
    } else {
      this.monthView -= counter;
    }
    if (this.monthView == 1) {
      this.disableButton = "forward";
    } else if (this.monthView == -1) {
      this.disableButton = "backward";
    } else {
      this.disableButton = "";
    }
    this.eventEmitterService.currentMonthChanged(this._calendar.activeDate)
  }
}