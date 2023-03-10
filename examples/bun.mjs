import { open } from '..';
import { run, bench } from 'mitata';

const db = open('/tmp/test.db');
const connection = db.connect();

const q = 'select i, i as a from generate_series(1, 2000) s(i)';

//const p = connection.prepare(q);
console.log('benchmarking query: ' + q);

bench('duckdb', () => {
//  p.query();
  connection.query_arrow(q);
});

await run({ percentiles: false });

connection.close();
db.close();