import * as lib from './lib.mjs';

export function open(path) {
  return new Database(lib.open(path));
}

const db_gc = new FinalizationRegistry(ptr => lib.close(ptr));
const con_gc = new FinalizationRegistry(ptr => lib.disconnect(ptr));

class Database {
  #ptr;
  
  constructor(ptr) {
    this.#ptr = ptr;
    db_gc.register(this, ptr, this);
  }

  connect() { 
    return new Connection(this, lib.connect(this.#ptr)); 
  }

  close() { 
    lib.close(this.#ptr);
    db_gc.unregister(this); 
    }
}

class Connection {
  #db;
  #ptr;

  constructor(db, ptr) {
    this.#db = db;
    this.#ptr = ptr;
    con_gc.register(this, ptr, this);
  }
  query_arrow(sql) { 
    return lib.query_arrow(this.#ptr, sql); 
  }
  close() { 
    lib.disconnect(this.#ptr); 
    con_gc.unregister(this); 
  }
}