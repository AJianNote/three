import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressModelComponent } from './compress-model.component';

describe('CompressModelComponent', () => {
  let component: CompressModelComponent;
  let fixture: ComponentFixture<CompressModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
