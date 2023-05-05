import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  @Output() currentMonth: EventEmitter<any> = new EventEmitter();

  currentMonthChanged(data:any): void {
    this.currentMonth.emit(data);
  }
}
