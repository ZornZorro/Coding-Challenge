import { Injectable } from '@angular/core';
import { Folder } from '../models/folder.model';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private rootFolder: Folder = {
    name: 'Root',
    type: 'folder',
    expanded: true,
    children: [
      {
        name: 'Documents',
        type: 'folder',
        expanded: false,
        children: [
          { name: 'report.pdf', type: 'file', size: 2.5 * 1024 * 1024 },
          { name: 'presentation.pptx', type: 'file', size: 5.7 * 1024 * 1024 },
          { name: 'notes.txt', type: 'file', size: 12 * 1024 }
        ]
      },
      {
        name: 'Images',
        type: 'folder',
        expanded: false,
        children: [
          { name: 'vacation.jpg', type: 'file', size: 3.2 * 1024 * 1024 },
          { name: 'profile.png', type: 'file', size: 1.1 * 1024 * 1024 },
          {
            name: 'Screenshots',
            type: 'folder',
            expanded: false,
            children: [
              { name: 'screenshot1.png', type: 'file', size: 0.8 * 1024 * 1024 },
              { name: 'screenshot2.png', type: 'file', size: 0.9 * 1024 * 1024 }
            ]
          }
        ]
      },
      {
        name: 'Projects',
        type: 'folder',
        expanded: false,
        children: [
          { name: 'project1', type: 'folder', children: [] },
          { name: 'project2', type: 'folder', children: [] },
          { name: 'archive.zip', type: 'file', size: 45.3 * 1024 * 1024 }
        ]
      },
      { name: 'README.md', type: 'file', size: 2.1 * 1024 },
      { name: 'package.json', type: 'file', size: 1.2 * 1024 }
    ]
  };

  constructor() {}

  /**
   * Get the root folder structure
   */
  getRootFolder(): Folder {
    return this.rootFolder;
  }

  /**
   * Toggle the expanded state of a folder
   * @param folder The folder to toggle
   */
  toggleFolder(folder: Folder): void {
    if (folder.type === 'folder') {
      folder.expanded = !folder.expanded;
    }
  }

  /**
   * Calculate the total size of a folder and its contents
   * @param folder The folder to calculate size for
   * @returns Total size in bytes
   */
  calculateTotalSize(folder: Folder): number {
    if (!folder) return 0;
    
    if (folder.type === 'file') {
      return folder.size || 0;
    }
    
    if (!folder.children || folder.children.length === 0) {
      return 0;
    }
    
    return folder.children.reduce((total, child) => {
      return total + this.calculateTotalSize(child);
    }, 0);
  }

  /**
   * Format a size in bytes to a human-readable string
   * @param bytes Size in bytes
   * @returns Formatted size string
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Handle cases where the size is exactly on a boundary (e.g., 1024 bytes = 1 KB)
    const formattedValue = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${formattedValue} ${sizes[i]}`;
  }
  
  /**
   * Count the number of items (files and folders) in a folder
   * @param folder The folder to count items in
   * @returns Object with fileCount and folderCount
   */
  countItems(folder: Folder): { fileCount: number, folderCount: number } {
    if (folder.type === 'file') {
      return { fileCount: 1, folderCount: 0 };
    }
    
    if (!folder.children || folder.children.length === 0) {
      return { fileCount: 0, folderCount: 1 }; // Count empty folder as 1 folder
    }
    
    return folder.children.reduce((counts, child) => {
      const childCounts = this.countItems(child);
      return {
        fileCount: counts.fileCount + childCounts.fileCount,
        folderCount: counts.folderCount + childCounts.folderCount
      };
    }, { fileCount: 0, folderCount: 1 }); // Start with 1 to count the current folder
  }
}
