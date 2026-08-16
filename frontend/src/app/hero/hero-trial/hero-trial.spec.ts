import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroTrial } from './hero-trial';

describe('HeroTrial', () => {
  let component: HeroTrial;
  let fixture: ComponentFixture<HeroTrial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroTrial],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroTrial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
