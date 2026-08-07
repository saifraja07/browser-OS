import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, NODE_STORE, PARENT_INDEX } from './constants.js';

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(NODE_STORE, { keyPath: 'id' });
        store.createIndex(PARENT_INDEX, 'parentId');
      },
    });
  }
  return dbPromise;
}

/** Loads every node record. Called once by VirtualFS on init to build its in-memory cache. */
export async function getAllNodes() {
  const db = await getDb();
  return db.getAll(NODE_STORE);
}

export async function getNode(id) {
  const db = await getDb();
  return db.get(NODE_STORE, id);
}

export async function getChildren(parentId) {
  const db = await getDb();
  return db.getAllFromIndex(NODE_STORE, PARENT_INDEX, parentId);
}

export async function putNode(node) {
  const db = await getDb();
  await db.put(NODE_STORE, node);
  return node;
}

export async function putNodes(nodes) {
  const db = await getDb();
  const tx = db.transaction(NODE_STORE, 'readwrite');
  await Promise.all([...nodes.map((n) => tx.store.put(n)), tx.done]);
}

export async function deleteNode(id) {
  const db = await getDb();
  await db.delete(NODE_STORE, id);
}

export async function deleteNodes(ids) {
  const db = await getDb();
  const tx = db.transaction(NODE_STORE, 'readwrite');
  await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done]);
}

/** Test/dev escape hatch — wipes the entire filesystem store. Never called from app code. */
export async function __clearAll() {
  const db = await getDb();
  await db.clear(NODE_STORE);
}
