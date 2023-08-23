import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstancingScatterComponent } from './instancing-scatter.component';

describe('InstancingScatterComponent', () => {
  let component: InstancingScatterComponent;
  let fixture: ComponentFixture<InstancingScatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstancingScatterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstancingScatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
