import { open } from '..';
import { tableFromIPC } from 'apache-arrow';
import { bench, run } from 'mitata';
const db = open(':memory:');
const con = db.connect();
bench('duckdb arrow c data', () => {
  con.query_arrow(`
  select i::int as a , i::int as b from generate_series(1,4000) s(i);
`);})
await run({ percentiles: false });
//const table = tableFromIPC(ipc);
//console.log(table.numRows);
con.close();
db.close();
