import { open, close,query, query_ipc, connect, disconnect} from './lib.mjs';
import * as vl from './node_modules/vega-lite-api/build/vega-lite-api.js';
const vega = require('vega');
const vegalite = require('vega-lite');
const db = open(':memory:');

const connection = connect(db);
const q1 = query_ipc(connection,'PRAGMA version');
console.table(q1.toArray());
const q2 = query(connection,`
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
const ipc = query_ipc(connection,`
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
  await Bun.write("test.svg", svg);
}).catch(function(err) {
  console.error(err);
});

console.table([...ipc]); 
disconnect(connection);
close(db);
