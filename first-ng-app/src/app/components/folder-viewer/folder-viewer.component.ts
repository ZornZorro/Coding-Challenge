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

  constructor(private folderService: FolderService) {}

  toggleContextMenu(event: MouseEvent, folder: Folder): void {
    event.stopPropagation();
    if (folder.type !== 'folder') return;
    
    if (this.selectedItem === folder && this.showMenu) {
      this.showMenu = false;
      this.showFolderNameInput = false;
    } else {
      this.selectedItem = folder;
      this.showMenu = true;
      this.currentParent = folder;
      this.showFolderNameInput = false;
    }
  }

  showNewFolderInput(folder: Folder): void {
    this.showFolderNameInput = true;
    this.selectedItem = folder;
    this.currentParent = folder;
    // Fokus auf das Eingabefeld setzen, sobald es angezeigt wird
    setTimeout(() => {
      const input = document.querySelector('.folder-name-input input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  hideContextMenu(): void {
    this.showMenu = false;
    this.showFolderNameInput = false;
    this.newFolderName = '';
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

    const newFile: Folder = {
      name: file.name,
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
    if (item.type === 'file') {
      return this.folderService.formatSize(item.size || 0);
    }
    const size = this.folderService.calculateTotalSize(item);
    return this.folderService.formatSize(size);
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
      this.formattedTotalSize = this.folderService.formatSize(this.totalSize);
      
      const counts = this.folderService.countItems(this.rootFolder);
      this.itemCounts = {
        files: counts.fileCount,
        folders: counts.folderCount - 1
      };
    }
  }
}
