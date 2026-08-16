import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroSubheading } from './hero-subheading';

describe('HeroSubheading', () => {
  let component: HeroSubheading;
  let fixture: ComponentFixture<HeroSubheading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSubheading],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSubheading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
