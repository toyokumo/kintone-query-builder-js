# Kintone Query Builder

[Kintone REST API](https://developer.cybozu.io/hc/ja/articles/202331474)のためのクエリビルダーおよびパーサーです。
Kintone query builderは`GET /records.json`の`query`パラメータ用の文字列を組み立てるのを助けます。


## インストール
```
npm install kintone-query-builder
```


### 使い方
```javascript
// ESModuleの場合
import { KintoneQueryBuilder, KintoneQueryParser, KintoneQueryExpression } from "kintone-query-builder";
// CommonJSの場合
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

### 例: kintone APIからの全レコードの取得
kintone APIの制限のため、一度に501レコード以上取得することはできません。
以下のようなコードが必要になったときはkintone query builderは便利です。
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
