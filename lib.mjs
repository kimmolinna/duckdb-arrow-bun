import { ptr, dlopen, toArrayBuffer } from 'bun:ffi';
import { RecordBatchReader } from 'apache-arrow';

const utf8e = new TextEncoder();

const path = {
  linux() { return new URL(`./bin/libduckdb_bun.so`, import.meta.url); },
  darwin() { return new URL(`./bin/libduckdb_bun.dylib`, import.meta.url); },
}[process.platform]().pathname;

const dab = dlopen(path, {
  dab_close: { args: ['ptr'], returns: 'void' },
  dab_connect: { args: ['ptr'], returns: 'ptr' },
  dab_disconnect: { args: ['ptr'], returns: 'void' },
  dab_open: { args: ['ptr'], returns: 'ptr' },
  dab_query: { args: ['ptr','ptr'], returns: 'ptr' },
  dab_query_ipc: { args: ['ptr','ptr'], returns: 'ptr' },
  dab_ipc_address: { args: ['ptr'], returns: 'ptr' },
  dab_ipc_size: { args: ['ptr'], returns: 'i64' }
}).symbols;

for (const k in dab) dab[k] = dab[k].native || dab[k];

export function close(db) {
  dab.dab_close(db);
}

export function disconnect(c) {
  dab.dab_disconnect(c);
}

export function connect(db) {
  const con = dab.dab_connect(db);
  if (0 === con) throw new Error('duckdb: failed to connect to database');
  return con;
}

export function open(path) {
  const db = dab.dab_open(ptr(utf8e.encode(path + '\0')));
  if (0 === db) throw new Error('duckdb: failed to open database');
  return db;
}

export function query(c, query) {
  const res = dab.dab_query(c, ptr(utf8e.encode(query + '\0')));
  return res;
}

export function query_ipc(c, query) {
  const ipc = dab.dab_query_ipc(c, ptr(utf8e.encode(query + '\0')));
  return RecordBatchReader.from(
    toArrayBuffer(
      dab.dab_ipc_address(ipc), 0, Number(dab.dab_ipc_size(ipc))
      )).readAll()[0];
}