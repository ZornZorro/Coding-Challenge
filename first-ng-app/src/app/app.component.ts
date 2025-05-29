import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="main-content">
      <app-home></app-home>
    </main>
  `,
  styles: [`
    .main-content {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class AppComponent {
  title = 'first-ng-app';
}
