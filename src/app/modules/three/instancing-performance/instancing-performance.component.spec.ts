import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstancingPerformanceComponent } from './instancing-performance.component';

describe('InstancingPerformanceComponent', () => {
  let component: InstancingPerformanceComponent;
  let fixture: ComponentFixture<InstancingPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstancingPerformanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstancingPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
