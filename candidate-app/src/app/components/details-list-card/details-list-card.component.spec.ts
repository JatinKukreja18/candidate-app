import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsListCardComponent } from './details-list-card.component';

describe('DetailsCardComponent', () => {
  let component: DetailsListCardComponent;
  let fixture: ComponentFixture<DetailsListCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsListCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsListCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
