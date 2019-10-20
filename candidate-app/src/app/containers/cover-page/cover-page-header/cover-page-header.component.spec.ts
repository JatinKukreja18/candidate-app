import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverPageHeaderComponent } from './cover-page-header.component';

describe('CoverPageHeaderComponent', () => {
  let component: CoverPageHeaderComponent;
  let fixture: ComponentFixture<CoverPageHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverPageHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
