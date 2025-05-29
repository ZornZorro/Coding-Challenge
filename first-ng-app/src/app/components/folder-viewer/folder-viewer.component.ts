import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../models/folder.model';
import { FolderService } from '../../services/folder.service';

interface ItemCounts {
  files: number;
  folders: number;
}

@Component({
  selector: 'app-folder-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder-viewer.component.html',
  styleUrls: ['./folder-viewer.component.scss']
})

export class FolderViewerComponent implements OnInit {
  rootFolder: Folder | null = null;
  totalSize: number = 0;
  formattedTotalSize: string = '0 Bytes';
  itemCounts: ItemCounts = { files: 0, folders: 0 };
  selectedItem: Folder | null = null;

  constructor(public folderService: FolderService) {}

  ngOnInit(): void {
    this.rootFolder = this.folderService.getRootFolder();
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
