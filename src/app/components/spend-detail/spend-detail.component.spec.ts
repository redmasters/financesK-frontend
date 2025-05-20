import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendDetailComponent } from './spend-detail.component';

describe('SpendDetailComponent', () => {
  let component: SpendDetailComponent;
  let fixture: ComponentFixture<SpendDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
