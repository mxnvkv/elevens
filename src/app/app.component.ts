import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map, skip, takeWhile, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('app') app: ElementRef;
  @ViewChild('menu') menu: ElementRef;

  clickEvents: Observable<Event> = fromEvent(document, 'click');

  constructor(
    private renderer: Renderer2
  ) {}

  toggleMenu() {
    this.renderer.setStyle(this.menu.nativeElement, 'margin-left', '0px');
    this.renderer.setStyle(this.app.nativeElement, 'margin-left', '300px');

    // menu closes when we click outside of itself
    this.clickEvents.pipe(
      map((event: Event) => (event.target as Element).className),
      skip(1),
      takeWhile(value => value === 'menu'),
      finalize(() => {
        this.renderer.setStyle(this.menu.nativeElement, 'margin-left', '-300px');
        this.renderer.setStyle(this.app.nativeElement, 'margin-left', '0px');
      })
    ).subscribe(console.log);
  }
}
