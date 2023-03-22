import { ptr, dlopen, toArrayBuffer } from 'bun:ffi';

const utf8e = new TextEncoder();

const path = {
  linux() { return new URL(`./bin/libduckdb_bun.so`, import.meta.url); },
//  darwin() { return new URL(`./bin/libduckdb_bun.dylib`, import.meta.url); },
  darwin() { return new URL(`../duckdb-zig-build/zig-out/lib/libduckdb_bun.dylib`, import.meta.url); },
}[process.platform]().pathname;

const dab = dlopen(path, {
  dab_close: { args: ['ptr'], returns: 'void' },
  dab_connect: { args: ['ptr'], returns: 'ptr' },
  dab_disconnect: { args: ['ptr'], returns: 'void' },
  dab_open: { args: ['ptr'], returns: 'ptr' },
  dab_query_arrow: { args: ['ptr','ptr'], returns: 'ptr' },
  dab_arrow_address: { args: ['ptr'], returns: 'ptr' },
  dab_arrow_size: { args: ['ptr'], returns: 'i64' }
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
export function query_arrow(c, query) {
  const res = dab.dab_query_arrow(c, ptr(utf8e.encode(query + '\0')));
  const address = dab.dab_arrow_address(res);
  const size = Number(dab.dab_arrow_size(res));
  const buf = toArrayBuffer(address, 0, size);
  // console.log(buf);
  // console.log([...table]); 
  return buf;
}