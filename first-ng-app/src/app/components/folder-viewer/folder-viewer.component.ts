import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Folder } from '../../models/folder.model';
import { FolderService } from '../../services/folder.service';

interface ItemCounts {
  files: number;
  folders: number;
}

@Component({
  selector: 'app-folder-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './folder-viewer.component.html',
  styleUrls: ['./folder-viewer.component.scss']
})

export class FolderViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('folderNameInput') folderNameInput!: ElementRef<HTMLInputElement>;
  
  rootFolder: Folder | null = null;
  totalSize: number = 0;
  formattedTotalSize: string = '0 Bytes';
  itemCounts: ItemCounts = { files: 0, folders: 0 };
  
  showMenu: boolean = false;
  selectedItem: Folder | null = null;
  showFolderNameInput: boolean = false;
  newFolderName: string = '';
  currentParent: Folder | null = null;
  contextMenuPosition = { top: '0', left: '0' };

  constructor(private folderService: FolderService) {}

  toggleContextMenu(event: MouseEvent, folder: Folder): void {
    event.stopPropagation();
    if (folder.type !== 'folder') return;
    
    if (this.selectedItem === folder && this.showMenu) {
      this.showMenu = false;
      this.showFolderNameInput = false;
    } else {
      this.selectedItem = folder;
      this.currentParent = folder;
      this.showMenu = true;
      this.showFolderNameInput = false;
      
      // Position des Kontextmenüs berechnen
      const x = event.clientX;
      const y = event.clientY;
      const menuWidth = 200; // Geschätzte Breite des Menüs
      const menuHeight = 100; // Geschätzte Höhe des Menüs
      
      // Stelle sicher, dass das Menü im sichtbaren Bereich bleibt
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left = x;
      let top = y;
      
      if (x + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth - 10;
      }
      
      if (y + menuHeight > viewportHeight) {
        top = viewportHeight - menuHeight - 10;
      }
      
      this.contextMenuPosition = {
        left: left + 'px',
        top: top + 'px'
      };
    }
  }

  showNewFolderInput(folder: Folder): void {
    this.showFolderNameInput = true;
    this.selectedItem = folder;
    this.currentParent = folder;
    this.newFolderName = ''; // Leere den vorherigen Namen
    
    // Fokus auf das Eingabefeld setzen, sobald es angezeigt wird
    setTimeout(() => {
      if (this.folderNameInput) {
        this.folderNameInput.nativeElement.focus();
      }
    });
  }
  
  createNewFolder(): void {
    if (!this.newFolderName.trim() || !this.currentParent) return;
    
    // Kürze den Namen auf 15 Zeichen und füge '...' hinzu, falls nötig
    let folderName = this.newFolderName.trim();
    if (folderName.length > 15) {
      folderName = folderName.substring(0, 15) + '...';
    }
    
    const newFolder: Folder = {
      name: folderName,
      type: 'folder',
      expanded: false,
      children: [],
      parent: this.currentParent,
      modified: new Date()
    };
    
    if (!this.currentParent.children) {
      this.currentParent.children = [];
    }
    
    this.currentParent.children.push(newFolder);
    this.currentParent.expanded = true;
    this.hideContextMenu();
    this.updateFolderStats();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  hideContextMenu(): void {
    this.showMenu = false;
    this.showFolderNameInput = false;
    this.selectedItem = null;
    this.currentParent = null;
    this.newFolderName = ''; // Leere das Eingabefeld beim Schließen
  }

  addFolder(): void {
    if (!this.currentParent || !this.newFolderName.trim()) {
      this.hideContextMenu();
      return;
    }

    const newFolder: Folder = {
      name: this.newFolderName.trim(),
      type: 'folder',
      expanded: false,
      parent: this.currentParent,
      children: []
    };

    if (!this.currentParent.children) {
      this.currentParent.children = [];
    }
    this.currentParent.children.push(newFolder);
    
    this.updateFolderStats();
    this.hideContextMenu();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!this.currentParent) return;

    // Kürze den Dateinamen auf 15 Zeichen und füge '...' hinzu, falls nötig
    let fileName = file.name;
    if (fileName.length > 15) {
      fileName = fileName.substring(0, 15) + '...';
    }

    const newFile: Folder = {
      name: fileName,
      type: 'file',
      size: file.size,
      modified: new Date(file.lastModified),
      parent: this.currentParent
    };

    if (!this.currentParent.children) {
      this.currentParent.children = [];
    }
    this.currentParent.children.push(newFile);
    
    this.updateFolderStats();
    this.hideContextMenu();
  }

  ngAfterViewInit(): void {
    // Setze den Fokus auf das Eingabefeld, wenn es angezeigt wird
    if (this.folderNameInput) {
      this.folderNameInput.nativeElement.focus();
    }
  }

  ngOnInit(): void {
    this.rootFolder = this.folderService.getFolderStructure();
    this.updateFolderStats();
  }

  toggleFolder(event: Event, folder: Folder): void {
    event.stopPropagation();
    if (folder.type === 'folder') {
      this.folderService.toggleFolder(folder);
      this.updateFolderStats();
    }
  }

  selectItem(item: Folder): void {
    this.selectedItem = item;
  }

  isSelected(item: Folder): boolean {
    return this.selectedItem === item;
  }


  getItemSize(item: Folder): string {
    let size = 0;
    if (item.type === 'file') {
      size = item.size || 0;
    } else {
      size = this.folderService.calculateTotalSize(item);
    }
    return this.formatSize(size);
  }


  getItemIcon(item: Folder): string {
    if (item.type === 'file') {
      const ext = item.name.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'pdf':
          return '📄';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return '🖼️';
        case 'zip':
        case 'rar':
        case '7z':
          return '🗜️';
        case 'txt':
        case 'md':
          return '📝';
        case 'json':
        case 'js':
        case 'ts':
        case 'html':
        case 'css':
        case 'scss':
          return '📄';
        default:
          return '📄';
      }
    } else {
      return item.expanded ? '📂' : '📁';
    }
  }


  private updateFolderStats(): void {
    if (this.rootFolder) {
      this.totalSize = this.folderService.calculateTotalSize(this.rootFolder);
      this.formattedTotalSize = this.formatSize(this.totalSize);
      const counts = this.folderService.countItems(this.rootFolder);
      this.itemCounts = {
        files: counts.fileCount,
        folders: counts.folderCount - 1
      };
    }
  }
  
  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length);
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    
    // Zeige mindestens 0.01 an, um zu vermeiden, dass 0 angezeigt wird
    return (formattedSize < 0.01 ? '0.01' : formattedSize) + ' ' + sizes[i - 1];
  }
}
