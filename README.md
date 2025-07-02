# Kintone Query Builder

[![npm version](https://badge.fury.io/js/kintone-query-builder.svg)](https://badge.fury.io/js/kintone-query-builder)

Query builder for [Kintone REST API](https://developer.kintone.io/hc/en-us/articles/213149287/) in JavaScript.
Kintone query builder helps you to make a parameter string `query` of `GET /records.json`.
And, this package contains kintone query parser.


## Install
```
npm install kintone-query-builder
```


### Usage
```javascript
// ESModule
import { KintoneQueryBuilder, KintoneQueryParser, KintoneQueryExpression } from "kintone-query-builder";
// CommonJS
const { KintoneQueryBuilder, KintoneQueryParser, KintoneQueryExpression } = require("kintone-query-builder");

const builder = new KintoneQueryBuilder();
builder.where("field", "=", "value")
  .andWhere(new KintoneQueryExpression()
    .where('name', '=', 'foo')
    .orWhere('age', '=', 20))
  .orderBy('$id')
  .limit(500)
  .offset(1000)
  .build();
// => "field = \"value\" and (name = \"foo\" or age = 20) order by $id limit 500 offset 1000"

const parser = new KintoneQueryParser();
const newBuilder = parser.parse("$id < 100 and field like \"content\" limit 500");
newBuilder.limit(100)
  .offset(100)
  .build();
// => "($id < 100 and field like \"content\") limit 100 offset 100"
```

### Example: fetch all records from kintone API
You can't get more than 500 records because of kintone API restriction.
In that situation, kintone query builder is very useful.
```javascript
import { KintoneQueryBuilder } from "kintone-query-builder";

builder = new KintoneQueryBuilder().where(...);
records = api.fetch(builder.build());
offset = 0;
records_max = 500; // max records you can get at once (kintone API restriction)
while(records.length > 0) {
  offset += records_max;
  records.push(...api.fetch(builder.offset(offset).build()));
}
```


## How to contribute
Feel free to send us pull requests.
### Setup
```
git clone https://github.com/toyokumo/kintone-query-builder-js.git
npm install
```

### Format
Run `npm run lint:fix`

### Testing
Run `npm test`.

## License
```
Copyright 2019 TOYOKUMO,Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
