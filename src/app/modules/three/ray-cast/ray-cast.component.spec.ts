import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RayCastComponent } from './ray-cast.component';

describe('RayCastComponent', () => {
  let component: RayCastComponent;
  let fixture: ComponentFixture<RayCastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RayCastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RayCastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
