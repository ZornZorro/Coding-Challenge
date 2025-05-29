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
  currentYear = new Date().getFullYear();;
}