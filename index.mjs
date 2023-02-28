import * as library from './lib.mjs';

export function open(path) {
  return new Database(library.open(path));
}

const database_garbage = new FinalizationRegistry(pointer => library.close(pointer));
const connection_garbage = new FinalizationRegistry(pointer => library.disconnect(pointer));

class Database {
  #pointer;

  constructor(pointer) {
    this.#pointer = pointer;
    database_garbage.register(this, pointer, this);
  }

  close() { 
    library.close(this.#pointer);
     database_garbage.unregister(this); 
    }
  connect() { 
    return new Connection(this, library.connect(this.#pointer)); 
  }
}

class Connection {
  #database;
  #pointer;

  constructor(database, pointer) {
    this.#database = database;
    this.#pointer = pointer;
    connection_garbage.register(this, pointer, this);
  }

  query_ipc(sql) { 
    return library.query(this.#pointer, sql); 
  }
  close() { 
    library.disconnect(this.#pointer); 
    connection_garbage.unregister(this); 
  }
}