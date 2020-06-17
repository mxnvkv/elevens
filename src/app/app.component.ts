import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('app') app: ElementRef;
  @ViewChild('menu') menu: ElementRef;

  isMenuShowed: boolean = false;

  constructor(
    private renderer: Renderer2
  ) {}

  showMenu() {
    if (this.isMenuShowed) {
      this.renderer.setStyle(this.menu.nativeElement, 'margin-left', '-300px');
      this.renderer.setStyle(this.app.nativeElement, 'margin-left', '0px');
      this.isMenuShowed = false;
    } else {
      this.renderer.setStyle(this.menu.nativeElement, 'margin-left', '0px');
      this.renderer.setStyle(this.app.nativeElement, 'margin-left', '300px');
      this.isMenuShowed = true;
    }
  }
}
