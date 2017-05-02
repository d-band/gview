gview
=====

[![Greenkeeper badge](https://badges.greenkeeper.io/d-band/gview.svg)](https://greenkeeper.io/)

> Fork from: [egraph](https://github.com/likr/egraph)

[![NPM version](https://img.shields.io/npm/v/gview.svg)](https://www.npmjs.com/package/gview)
[![NPM downloads](https://img.shields.io/npm/dm/gview.svg)](https://www.npmjs.com/package/gview)

## Install

```bash
$ npm install gview
```

## Usage

[Example](examples/)

```
var GView = require('gview');

var data = {
  vertices: [{
    id: 1,
    name: 'node-1'
  }, {
    id: 2,
    name: 'node-2'
  }],
  edges: [{
    from: 1,
    to: 2
  }]
};

var viewer = new GView('root', data, {
  width: 800,
  height: 400,
  hited: function(list) {
    console.log(list);
  }
});
```

![image](examples/img1.png)


## Develop

```
# Dev
$ dool server

# Build
$ dool build
```

## Report a issue

* [All issues](https://github.com/d-band/gview/issues)
* [New issue](https://github.com/d-band/gview/issues/new)

## License

gview is available under the terms of the MIT License.
