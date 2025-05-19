import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendListComponent } from './spend-list.component';

describe('SpendListComponent', () => {
  let component: SpendListComponent;
  let fixture: ComponentFixture<SpendListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
