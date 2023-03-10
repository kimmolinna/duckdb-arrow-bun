import { open } from '..';

const db = open(':memory:');
const con = db.connect();
const ipc = await con.query_arrow(`
  select i::int as a , i::int as b from generate_series(1,5000) s(i);
`);
console.log([...ipc]); 
con.close();
db.close();
