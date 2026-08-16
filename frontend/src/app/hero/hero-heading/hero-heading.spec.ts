import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroHeading } from './hero-heading';

describe('HeroHeading', () => {
  let component: HeroHeading;
  let fixture: ComponentFixture<HeroHeading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroHeading],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroHeading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
