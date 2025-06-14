import { Injectable } from '@angular/core';
import { Folder } from '../models/folder.model';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private rootFolder: Folder = {
    name: 'Root',
    type: 'folder',
    expanded: false,
    children: [
      {
        name: 'Documents',
        type: 'folder',
        expanded: false,
        children: [
          { name: 'report.pdf', type: 'file', size: 3 * 1024 * 1024 },
          { name: 'presentation.pptx', type: 'file', size: 7 * 1024 * 1024 },
        ]
      },
      {
        name: 'Images',
        type: 'folder',
        expanded: false,
        children: [
          { name: 'vacation.jpg', type: 'file', size: 5 * 1024 * 1024 },
        ]
      },
      { name: 'package.json', type: 'file', size: 2 * 1024 * 1024}
    ]
  };

  constructor() {}


  getRootFolder(): Folder {
    return this.rootFolder;
  }

  // Alias für getRootFolder für bessere Lesbarkeit
  getFolderStructure(): Folder {
    return this.getRootFolder();
  }


  toggleFolder(folder: Folder): void {
    if (folder.type === 'folder') {
      folder.expanded = !folder.expanded;
    }
  }

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


  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    const formattedValue = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${formattedValue} ${sizes[i]}`;
  }
  
  countItems(folder: Folder): { fileCount: number, folderCount: number } {
    if (folder.type === 'file') {
      return { fileCount: 1, folderCount: 0 };
    }
    
    if (!folder.children || folder.children.length === 0) {
      return { fileCount: 0, folderCount: 1 };
    }
    
    return folder.children.reduce((counts, child) => {
      const childCounts = this.countItems(child);
      return {
        fileCount: counts.fileCount + childCounts.fileCount,
        folderCount: counts.folderCount + childCounts.folderCount
      };
    }, { fileCount: 0, folderCount: 1 });
  }
}
