# primus-rooms-reverse-wildcard-adapter

An adapter for [`primus-rooms`](https://www.npmjs.com/package/primus-rooms) that is identical to [`primus-rooms-adapater`](https://www.npmjs.com/package/primus-rooms-adapter) except that the wildcard behavior is reversed.

## Installation

```
$ npm install primus-rooms-reverse-wildcard-adapter
```


## Description

The good people who've built the Primus real-time framework and, in particular, the [`primus-rooms`](https://www.npmjs.com/package/primus-rooms) plugin kindly included support for wildcards in the room naming system. However, for my use case it was implemented in the reverse direction that I would want to use. This package is merely a change/extension of the default [`primus-rooms-adapater`](https://www.npmjs.com/package/primus-rooms-adapter) that sets up the behavior in reverse.

## Usage

### Using the ReverseWildcardAdapter adapter with Rooms

Pass the adapter instance as an argument to Primus.plugins.rooms like so:

```javascript
var Primus = require('primus');
var Rooms = require('primus-rooms');
var ReverseWildcardAdapter = require('primus-rooms-reverse-wildcard-adapter');

var reverseWildcardAdapter = new ReverseWildcardAdapter();

var primus = new Primus(url, {
  transformer: 'ws',
  rooms: { adapter: reverseWildcardAdapter },
  plugins: {
    rooms: Rooms
  }
});
```

Or set your custom adapter for rooms, like this (I could not get this to work for me, but it's consistently noted as a way to do the same thing as above):

```javascript
var ReverseWildcardAdapter = require('primus-rooms-reverse-wildcard-adapter');

primus.use('rooms', Rooms);

// by setting the property
primus.adapter = new ReverseWildcardAdapter();
```

### Targeting broadcasts to rooms that match wildcards

Let's say you have the following scenario:
  - Your room naming convention is `<organization_id>:<role>`
  - Client 'A' on organization `ORG1234` is an `admin` and is therefore connected to room `ORG1234:admin`
  - Client 'B' on organization `ORG1234` is a `guest` and is therefore connected to room `ORG1234:guest`

To target a broadcast to all clients with an `organization_id` of `ORG1234` regardless of their `role` you can do the following:

```javascript
var data = {foo: 'bar'};
// Client A and Client B both receive this message.
primus.room('ORG1234:*').write(data);
```

You can still target "only admins of ORG1234" as you would expect:

```javascript
var data = {foo: 'bar'};
// Client A only receives this message. Client B does not receive this message.
primus.room('ORG1234:admin').write(data);
```

## API (Abstract public methods)

This See [`primus-rooms-adapater`](https://www.npmjs.com/package/primus-rooms-adapter) documentation for details. This package has not changed that API.

## TODO

Add/update the tests. This package has not added or altered any tests, and the [`primus-rooms-adapater`](https://www.npmjs.com/package/primus-rooms-adapter) from which it was forked mentions that it could use more tests. Use "as is".

## License

(The MIT License)

Copyright (c) 2013 Jonathan Brumley &lt;cayasso@gmail.com&gt; and 2018 Christopher Newhouse &lt;c.newhouse@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
