import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemindersListComponent } from './reminders-list.component';

describe('RemindersListComponent', () => {
  let component: RemindersListComponent;
  let fixture: ComponentFixture<RemindersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemindersListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemindersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
