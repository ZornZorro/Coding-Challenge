import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderViewerComponent } from '../components/folder-viewer/folder-viewer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FolderViewerComponent]
})
export class HomeComponent {
  homeMessage = signal("Hello World");
  currentYear = new Date().getFullYear();

  keyUpHandler(event: KeyboardEvent) {
    console.log(`user pressed the ${event.key} key`);
  }
}