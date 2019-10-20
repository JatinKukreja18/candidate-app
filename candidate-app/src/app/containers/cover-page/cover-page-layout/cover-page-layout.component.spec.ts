import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverPageLayoutComponent } from './cover-page-layout.component';

describe('CoverPageLayoutComponent', () => {
  let component: CoverPageLayoutComponent;
  let fixture: ComponentFixture<CoverPageLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverPageLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverPageLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
