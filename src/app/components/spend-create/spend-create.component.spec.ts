import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendCreateComponent } from './spend-create.component';

describe('SpendCreateComponent', () => {
  let component: SpendCreateComponent;
  let fixture: ComponentFixture<SpendCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
