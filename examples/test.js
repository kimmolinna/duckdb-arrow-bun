import { open } from '..';

const db = open(':memory:');
const con = db.connect();
const q2 = con.query_arrow(`
  CREATE TABLE data AS 
    SELECT
      timestamp,
      date_part('year',timestamp)::INT as year,
      date_part('month',timestamp)::INT as month,
      date_part('hour',timestamp)::INT as hour,
      timestamp::date as day,
      consumption
    FROM 
      parquet_scan('data/home_*.parquet');
`);
const ipc = con.query_arrow(`
  SELECT 
  year,
  month,
  round(sum(consumption),2) as consumption
  FROM data
  GROUP BY year,month
`);

console.log([...ipc]); 
con.close();
db.close();
