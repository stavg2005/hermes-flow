// src/services/WorkflowIndexedDB.ts
// Basic IndexedDB service - starting simple

export interface BasicWorkflow {
  id: string;
  name: string;
  nodes: any[]; // Using any[] for now to match your existing types
  edges: any[];
  createdAt: string;
}

export class WorkflowIndexedDB {
  private dbName = 'HermesWorkflowDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Initialize the database
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Initializing IndexedDB...');

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = event => {
        console.log('Setting up IndexedDB schema...');
        const db = (event.target as IDBOpenDBRequest).result;

        // Create workflows object store (like a table)
        if (!db.objectStoreNames.contains('workflows')) {
          const workflowStore = db.createObjectStore('workflows', {
            keyPath: 'id',
          });

          // Create an index to search by name
          workflowStore.createIndex('name', 'name', { unique: false });

          console.log('✅ Workflows store created');
        }
      };
    });
  }

  // Save a workflow
  async saveWorkflow(workflow: BasicWorkflow): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['workflows'], 'readwrite');
      const store = transaction.objectStore('workflows');

      const request = store.put(workflow);

      request.onsuccess = () => {
        console.log('✅ Workflow saved:', workflow.name);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to save workflow:', request.error);
        reject(request.error);
      };
    });
  }

  // Get all workflows
  async getAllWorkflows(): Promise<BasicWorkflow[]> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['workflows'], 'readonly');
      const store = transaction.objectStore('workflows');
      const request = store.getAll();

      request.onsuccess = () => {
        const workflows = request.result;
        console.log(`✅ Loaded ${workflows.length} workflows from IndexedDB`);
        resolve(workflows);
      };

      request.onerror = () => {
        console.error('❌ Failed to load workflows:', request.error);
        reject(request.error);
      };
    });
  }

  // Get a specific workflow by ID
  async getWorkflow(id: string): Promise<BasicWorkflow | null> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['workflows'], 'readonly');
      const store = transaction.objectStore('workflows');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Delete a workflow
  async deleteWorkflow(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['workflows'], 'readwrite');
      const store = transaction.objectStore('workflows');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('✅ Workflow deleted');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to delete workflow:', request.error);
        reject(request.error);
      };
    });
  }
}

// Create a singleton instance
export const workflowDB = new WorkflowIndexedDB();
