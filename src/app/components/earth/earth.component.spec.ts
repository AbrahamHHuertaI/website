import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarthComponent } from './earth.component';

describe('EarthComponent', () => {
  let component: EarthComponent;
  let fixture: ComponentFixture<EarthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EarthComponent]
    });
    fixture = TestBed.createComponent(EarthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
