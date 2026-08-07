import * as storage from './storageDriver.js';
import { ROOT_ID, NODE_TYPE, FsError } from './constants.js';
import { splitPath, dirname, basename, isRoot, joinPath } from './pathUtils.js';

function makeNode({ id, parentId, name, type, content = '', mimeType = null }) {
  const now = Date.now();
  return {
    id,
    parentId,
    name,
    type,
    content: type === NODE_TYPE.FILE ? content : null,
    mimeType,
    size: type === NODE_TYPE.FILE ? new Blob([content]).size : 0,
    createdAt: now,
    updatedAt: now,
  };
}

class VirtualFS {
  #nodes = new Map(); // id -> node
  #children = new Map(); // parentId -> Set<id>
  #listeners = new Set();
  #ready = null;

  /** Loads all nodes from the Storage Driver and builds the in-memory tree. Idempotent. */
  init() {
    if (!this.#ready) {
      this.#ready = this.#load();
    }
    return this.#ready;
  }

  async #load() {
    const all = await storage.getAllNodes();
    this.#nodes.clear();
    this.#children.clear();

    for (const node of all) {
      this.#index(node);
    }

    if (!this.#nodes.has(ROOT_ID)) {
      const root = makeNode({ id: ROOT_ID, parentId: null, name: '/', type: NODE_TYPE.FOLDER });
      await storage.putNode(root);
      this.#index(root);
    }
  }

  #index(node) {
    this.#nodes.set(node.id, node);
    if (node.parentId) {
      if (!this.#children.has(node.parentId)) this.#children.set(node.parentId, new Set());
      this.#children.get(node.parentId).add(node.id);
    }
  }

  #unindex(node) {
    this.#nodes.delete(node.id);
    this.#children.get(node.parentId)?.delete(node.id);
    this.#children.delete(node.id);
  }

  #emit(event, payload) {
    for (const listener of this.#listeners) listener(event, payload);
  }

  /** Subscribe to fs changes. Returns an unsubscribe function. */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  // --- Path resolution -----------------------------------------------------

  #resolve(path) {
    if (isRoot(path)) return this.#nodes.get(ROOT_ID);

    let current = this.#nodes.get(ROOT_ID);
    for (const segment of splitPath(path)) {
      if (!current || current.type !== NODE_TYPE.FOLDER) return null;
      const childIds = this.#children.get(current.id) ?? new Set();
      let next = null;
      for (const id of childIds) {
        const candidate = this.#nodes.get(id);
        if (candidate?.name === segment) {
          next = candidate;
          break;
        }
      }
      current = next;
    }
    return current;
  }

  #resolveOrThrow(path) {
    const node = this.#resolve(path);
    if (!node) throw new FsError('ENOENT', `No such file or directory: ${path}`);
    return node;
  }

  // --- Public API ------------------------------------------------------------

  async exists(path) {
    await this.init();
    return Boolean(this.#resolve(path));
  }

  async stat(path) {
    await this.init();
    const node = this.#resolveOrThrow(path);
    const { content, ...meta } = node;
    return meta;
  }

  async readDir(path) {
    await this.init();
    const node = this.#resolveOrThrow(path);
    if (node.type !== NODE_TYPE.FOLDER) throw new FsError('ENOTDIR', `Not a directory: ${path}`);

    const childIds = this.#children.get(node.id) ?? new Set();
    const children = [...childIds].map((id) => this.#nodes.get(id));

    return children
      .filter(Boolean)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === NODE_TYPE.FOLDER ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map(({ content, ...meta }) => meta);
  }

  async readFile(path) {
    await this.init();
    const node = this.#resolveOrThrow(path);
    if (node.type !== NODE_TYPE.FILE) throw new FsError('EISDIR', `Not a file: ${path}`);
    return node.content;
  }

  async writeFile(path, content, { mimeType = null } = {}) {
    await this.init();
    const existing = this.#resolve(path);

    if (existing) {
      if (existing.type !== NODE_TYPE.FILE) {
        throw new FsError('EISDIR', `Cannot write, is a directory: ${path}`);
      }
      const updated = {
        ...existing,
        content,
        mimeType: mimeType ?? existing.mimeType,
        size: new Blob([content]).size,
        updatedAt: Date.now(),
      };
      await storage.putNode(updated);
      this.#index(updated);
      this.#emit('write', { path, node: updated });
      return updated;
    }

    const parent = this.#resolveOrThrow(dirname(path));
    if (parent.type !== NODE_TYPE.FOLDER) {
      throw new FsError('ENOTDIR', `Parent is not a directory: ${dirname(path)}`);
    }

    const node = makeNode({
      id: crypto.randomUUID(),
      parentId: parent.id,
      name: basename(path),
      type: NODE_TYPE.FILE,
      content,
      mimeType,
    });
    await storage.putNode(node);
    this.#index(node);
    this.#emit('create', { path, node });
    return node;
  }

  async mkdir(path, { recursive = false } = {}) {
    await this.init();
    if (await this.exists(path)) {
      const node = this.#resolve(path);
      if (node.type === NODE_TYPE.FOLDER) return node;
      throw new FsError('EEXIST', `File already exists at: ${path}`);
    }

    const parentPath = dirname(path);
    let parent = this.#resolve(parentPath);

    if (!parent) {
      if (!recursive) {
        throw new FsError('ENOENT', `Parent directory does not exist: ${parentPath}`);
      }
      parent = await this.mkdir(parentPath, { recursive: true });
    }
    if (parent.type !== NODE_TYPE.FOLDER) {
      throw new FsError('ENOTDIR', `Parent is not a directory: ${parentPath}`);
    }

    const node = makeNode({
      id: crypto.randomUUID(),
      parentId: parent.id,
      name: basename(path),
      type: NODE_TYPE.FOLDER,
    });
    await storage.putNode(node);
    this.#index(node);
    this.#emit('create', { path, node });
    return node;
  }

  async delete(path, { recursive = false } = {}) {
    await this.init();
    if (isRoot(path)) throw new FsError('EPERM', 'Cannot delete root');

    const node = this.#resolveOrThrow(path);
    const descendants = this.#collectDescendants(node.id);

    if (node.type === NODE_TYPE.FOLDER && descendants.length > 0 && !recursive) {
      throw new FsError('ENOTEMPTY', `Directory not empty: ${path}`);
    }

    const idsToDelete = [node.id, ...descendants.map((d) => d.id)];
    await storage.deleteNodes(idsToDelete);
    for (const id of idsToDelete) {
      const n = this.#nodes.get(id);
      if (n) this.#unindex(n);
    }
    this.#emit('delete', { path, id: node.id });
  }

  #collectDescendants(id) {
    const result = [];
    const stack = [...(this.#children.get(id) ?? [])];
    while (stack.length) {
      const childId = stack.pop();
      const child = this.#nodes.get(childId);
      if (!child) continue;
      result.push(child);
      stack.push(...(this.#children.get(childId) ?? []));
    }
    return result;
  }

  /** Moves and/or renames a node in one operation. */
  async move(fromPath, toPath) {
    await this.init();
    if (isRoot(fromPath)) throw new FsError('EPERM', 'Cannot move root');

    const node = this.#resolveOrThrow(fromPath);
    if (await this.exists(toPath)) {
      throw new FsError('EEXIST', `Destination already exists: ${toPath}`);
    }

    const newParent = this.#resolveOrThrow(dirname(toPath));
    if (newParent.type !== NODE_TYPE.FOLDER) {
      throw new FsError('ENOTDIR', `Destination parent is not a directory: ${dirname(toPath)}`);
    }

    // Guard against moving a folder into its own descendant.
    if (node.type === NODE_TYPE.FOLDER) {
      const descendants = this.#collectDescendants(node.id);
      if (descendants.some((d) => d.id === newParent.id)) {
        throw new FsError('EINVAL', 'Cannot move a folder into its own descendant');
      }
    }

    this.#children.get(node.parentId)?.delete(node.id);
    const updated = {
      ...node,
      parentId: newParent.id,
      name: basename(toPath),
      updatedAt: Date.now(),
    };
    await storage.putNode(updated);
    this.#index(updated);
    this.#emit('move', { from: fromPath, to: toPath, node: updated });
    return updated;
  }

  async rename(path, newName) {
    return this.move(path, joinPath(dirname(path), newName));
  }

  /** Recursively counts files/folders and total bytes under `path` (defaults to root). */
  async getStats(path = '/') {
    await this.init();
    const node = this.#resolveOrThrow(path);
    const descendants = node.type === NODE_TYPE.FOLDER ? this.#collectDescendants(node.id) : [];
    const all = node.type === NODE_TYPE.FOLDER ? descendants : [node];

    let fileCount = 0;
    let folderCount = 0;
    let totalBytes = 0;
    for (const n of all) {
      if (n.type === NODE_TYPE.FILE) {
        fileCount += 1;
        totalBytes += n.size;
      } else {
        folderCount += 1;
      }
    }
    return { fileCount, folderCount, totalBytes };
  }

  /** Deletes everything under root, keeping root itself. Used by Settings' "Reset Filesystem". */
  async reset() {
    await this.init();
    const rootChildIds = [...(this.#children.get(ROOT_ID) ?? [])];
    for (const id of rootChildIds) {
      const child = this.#nodes.get(id);
      if (child) await this.delete(joinPath('/', child.name), { recursive: true });
    }
    this.#emit('reset', {});
  }
}

// Singleton — one filesystem for the whole OS session, matching how a real
// OS has exactly one root filesystem. Apps import this instance directly.
export const virtualFS = new VirtualFS();
