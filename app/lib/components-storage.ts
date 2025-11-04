/**
 * Client-side component storage using ComponentDB
 * This file provides wrapper functions for component CRUD operations
 */

import { ComponentDB, ComponentEntry } from './database';

// Get all components
export async function getAllComponents(): Promise<ComponentEntry[]> {
  const db = ComponentDB.getInstance();
  return await db.getAll();
}

// Get component by ID
export async function getComponentById(id: string): Promise<ComponentEntry | null> {
  const db = ComponentDB.getInstance();
  return await db.getById(id);
}

// Create new component
export async function createComponent(
  name: string,
  code: string,
  description?: string
): Promise<string> {
  const db = ComponentDB.getInstance();
  const id = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.create({
    id,
    name,
    code,
    description: description || ''
  });

  return id;
}

// Update component
export async function updateComponent(
  id: string,
  updates: Partial<Pick<ComponentEntry, 'name' | 'code' | 'description'>>
): Promise<void> {
  const db = ComponentDB.getInstance();
  await db.update(id, updates);
}

// Delete component
export async function deleteComponent(id: string): Promise<void> {
  const db = ComponentDB.getInstance();
  await db.delete(id);
}
