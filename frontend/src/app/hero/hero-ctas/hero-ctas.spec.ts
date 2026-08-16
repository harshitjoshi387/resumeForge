import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroCtas } from './hero-ctas';

describe('HeroCtas', () => {
  let component: HeroCtas;
  let fixture: ComponentFixture<HeroCtas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroCtas],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroCtas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
