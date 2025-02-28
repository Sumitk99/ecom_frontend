import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadMdComponent } from './read-md.component';

describe('ReadMdComponent', () => {
  let component: ReadMdComponent;
  let fixture: ComponentFixture<ReadMdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReadMdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadMdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
