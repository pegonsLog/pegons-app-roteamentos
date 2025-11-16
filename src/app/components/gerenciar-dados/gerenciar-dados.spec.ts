import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciarDados } from './gerenciar-dados';

describe('GerenciarDados', () => {
  let component: GerenciarDados;
  let fixture: ComponentFixture<GerenciarDados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarDados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenciarDados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
