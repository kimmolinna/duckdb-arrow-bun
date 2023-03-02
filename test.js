import { open } from '@kimmolinna/duckdb-arrow-bun';
import * as vl from 'vega-lite-api';
const vega = require('vega');
const vegalite = require('vega-lite');

const db = open(':memory:');
const con = db.connect();
const q1 = con.query_ipc('PRAGMA version');
console.table(q1.toArray());
const q2 = con.query(`
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
const ipc = con.query_ipc(`
  SELECT 
  year,
  month,
  round(sum(consumption),2) as consumption
  FROM data
  GROUP BY year,month
`);
const vlSpecApi = JSON.stringify( // wrap everything in stringify to create a clean string
  vl.markBar()
    .encode(
      vl.x().fieldO("month"),
      vl.y().fieldQ("consumption")
    )
    .height(200)
    .data([...ipc])
    .toObject() // call toObject() instead of render()
)
const vlSpec = JSON.parse(vlSpecApi); // parse the string to get the object
const vegaSpec = vegalite.compile(vlSpec).spec;             // convert Vega-Lite to Vega
const view = new vega.View(vega.parse(vegaSpec),{renderer: 'none'});
view.toSVG().then(async function (svg) {
  await Bun.write("vega_lite_plot.svg", svg);
}).catch(function(err) {
  console.error(err);
});

console.table([...ipc]); 
con.close();
db.close();
