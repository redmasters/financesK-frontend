import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendEditComponent } from './spend-edit.component';

describe('SpendEditComponent', () => {
  let component: SpendEditComponent;
  let fixture: ComponentFixture<SpendEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
