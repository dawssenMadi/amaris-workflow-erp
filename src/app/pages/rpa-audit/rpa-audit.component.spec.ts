import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RpaAuditComponent } from './rpa-audit.component';

describe('RpaAuditComponent', () => {
  let component: RpaAuditComponent;
  let fixture: ComponentFixture<RpaAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RpaAuditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RpaAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
