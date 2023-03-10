<h1 align=center>@kimmolinna/duckdb-arrow-bun</h1>
<div><a href=https://duckdb.org>DuckDB</a> results as <a href=https://arrow.apache.org>Apache Arrow</a>'s RecordBatch to <a href=https://bun.sh>Bun</a> runtime</div>

<br />

### Install
`bun install @kimmolinna/duckdb-arrow-bun`


## Features
- using DuckDB's Arrow C Data interface to get results as Arrow RecordBatch and pass it to Bun runtime via buffer 
- benchmark is coming soon
<br />

## Examples

```js
import { open } from '@kimmolinna/duckdb-arrow-bun';

const db = open(':memory:');

const connection = db.connect();

connection.query('select 1 as number') // -> [{ number: 1 }]

connection.query_arrow('select 1 as number') // -> [{ number: 1 }]
connection.close();
db.close();
```

## License

MIT © [Kimmo Linna](https://github.com/kimmolinna)