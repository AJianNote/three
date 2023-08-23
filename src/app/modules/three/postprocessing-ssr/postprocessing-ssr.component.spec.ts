import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostprocessingSsrComponent } from './postprocessing-ssr.component';

describe('PostprocessingSsrComponent', () => {
  let component: PostprocessingSsrComponent;
  let fixture: ComponentFixture<PostprocessingSsrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostprocessingSsrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostprocessingSsrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
