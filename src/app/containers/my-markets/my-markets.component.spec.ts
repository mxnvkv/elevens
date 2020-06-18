import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMarketsComponent } from './my-markets.component';

describe('MyMarketsComponent', () => {
  let component: MyMarketsComponent;
  let fixture: ComponentFixture<MyMarketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyMarketsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyMarketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
