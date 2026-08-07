export const DB_NAME = 'browseros-fs';
export const DB_VERSION = 1;
export const NODE_STORE = 'nodes';
export const PARENT_INDEX = 'byParent';

export const ROOT_ID = 'root';

export const NODE_TYPE = {
  FILE: 'file',
  FOLDER: 'folder',
};

/** fs-style error with a `.code` a caller can branch on, mirroring Node's errno codes. */
export class FsError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'FsError';
    this.code = code;
  }
}
