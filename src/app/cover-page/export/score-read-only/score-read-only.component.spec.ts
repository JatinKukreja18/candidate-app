import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreReadOnlyComponent } from './score-read-only.component';

describe('ScoreReadOnlyComponent', () => {
  let component: ScoreReadOnlyComponent;
  let fixture: ComponentFixture<ScoreReadOnlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreReadOnlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreReadOnlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
