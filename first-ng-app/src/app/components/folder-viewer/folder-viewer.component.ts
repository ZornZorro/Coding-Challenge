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

  /**
   * Toggle the expanded state of a folder
   * @param event Click event
   * @param folder The folder to toggle
   */
  toggleFolder(event: Event, folder: Folder): void {
    event.stopPropagation();
    if (folder.type === 'folder') {
      this.folderService.toggleFolder(folder);
      this.updateFolderStats();
    }
  }

  /**
   * Select an item (file or folder)
   * @param item The item to select
   */
  selectItem(item: Folder): void {
    this.selectedItem = item;
  }

  /**
   * Check if an item is currently selected
   * @param item The item to check
   * @returns True if the item is selected
   */
  isSelected(item: Folder): boolean {
    return this.selectedItem === item;
  }

  /**
   * Get the size of an item, formatted for display
   * @param item The item to get the size for
   * @returns Formatted size string
   */
  getItemSize(item: Folder): string {
    if (item.type === 'file') {
      return this.folderService.formatSize(item.size || 0);
    }
    const size = this.folderService.calculateTotalSize(item);
    return this.folderService.formatSize(size);
  }

  /**
   * Get the appropriate icon for an item
   * @param item The item to get the icon for
   * @returns Icon string
   */
  getItemIcon(item: Folder): string {
    if (item.type === 'file') {
      // Return different icons based on file extension
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

  /**
   * Update folder statistics (total size and item counts)
   */
  private updateFolderStats(): void {
    if (this.rootFolder) {
      this.totalSize = this.folderService.calculateTotalSize(this.rootFolder);
      this.formattedTotalSize = this.folderService.formatSize(this.totalSize);
      
      const counts = this.folderService.countItems(this.rootFolder);
      this.itemCounts = {
        files: counts.fileCount,
        folders: counts.folderCount - 1 // Subtract 1 to exclude the root folder
      };
    }
  }
}
