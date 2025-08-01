import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WikiDetailComponent } from './wiki-detail.component';

describe('WikiDetailComponent', () => {
  let component: WikiDetailComponent;
  let fixture: ComponentFixture<WikiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WikiDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WikiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
