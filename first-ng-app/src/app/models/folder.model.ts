export interface Folder {
  name: string;
  type: 'folder' | 'file';
  size?: number;
  children?: Folder[];
  expanded?: boolean;
  parent?: Folder;
  modified?: Date;
}
