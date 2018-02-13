# primus-rooms-reverse-wildcard-adapter

An adapter for [`primus-rooms`](https://www.npmjs.com/package/primus-rooms) that is identical to [`primus-rooms-adapater`](https://www.npmjs.com/package/primus-rooms-adapter) except that the wildcard behavior has been flipped around and modified.

## Installation

```
$ npm install primus-rooms-reverse-wildcard-adapter
```


## Description

The good people who've built the Primus real-time framework and, in particular, the [`primus-rooms`](https://www.npmjs.com/package/primus-rooms) plugin kindly included support for wildcards in the room naming system. However, for my use case it was implemented in the reverse direction that I would want to use. This package is a change/extension of the default [`primus-rooms-adapater`](https://www.npmjs.com/package/primus-rooms-adapter) that sets up the behavior in reverse, with some modifications and additional rules. Probably best to understand by looking at the rest of the documentation and examples below.

## Usage

### Using the ReverseWildcardAdapter adapter with Rooms

To make use of this package, you must use it at the adapter for `primus-rooms`. There are a few ways to get this done:

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


### Notable usage examples

This package is made most powerful by the use of "sub-rooms" in your room naming convention. Sub-rooms allow for more granular targeting of rooms using wildcards. Sub-rooms need to be delimitted (see options below for more). Sub-rooms can be as deep or as shallow as you like. Examples:

```javascript
// This Client A has previously joined room `USA:skiing:halfpipe`
const clientA;
// This Client B has previously joined room `USA:snowboarding:halfpipe`
const clientB;

// Both Client A and Client B receive this message
primus.room('USA:*:halfpipe').write(data);
```

Wildcards can only be used to match an entire sub-room. You cannot use a wildcard as only part of a sub-room's string identifier. Wildcard patterns that are present as only part of a sub-room's identifier will be treated as literals. **There are no regular expressions used in this package**. Example:

```javascript
// This Client A has previously joined room `USA:NewJersey:07901`
const clientA;

// Client A will *not* receive this message
primus.room('USA:NewJersey:079*').write(data);
```

Rooms that match a given wildcard targeting pattern must be occupied by any clients you are hoping to reach. This package does not alter the way that `primus-rooms` assigns clients to rooms; it merely translates a wilcard pattern into an array of rooms ids that match that pattern, and then messages any clients in those rooms. Example:

```javascript
// This Client A has previously joined room `USA:NewJersey:Summit`
const clientA;

// This Client B has previously joined room `USA:NewJersey`
const clientB;

// Client A will *not* receive this message because it is not a member of the
// 'USA:NewJersey' room (or any 2-part room with 'USA' as the primary room).
// Client B will receive this message.
primus.room('USA:*').write(data);

// Client A will receive this message.
// Client B will *not* receive this message because it is not a member of the
// 'USA:NewJersey:Summit' room (or any 3-part room with 'USA' as the primary room).
primus.room('USA:*:*').write(data);
```


## API (Abstract public methods)

This See [`primus-rooms-adapater`](https://www.npmjs.com/package/primus-rooms-adapter) documentation for details. This package has not changed that API.

In addition to the inherited API mentioned above, `primus-rooms-reverse-wildcard-adapter` does support some additional settings/options. Here they are with their defaults listed and a brief description:
  1. `enabled: true`: Boolean indicating whether or not the wildcard-portion of this adapter should actually perform wildcard-related actions. Perhaps you want to disable it sometimes or for some reason, and this is your way.
  2. `delimitter: ':'`: String indicating what delimitter your room naming convention uses. This is what will be used to split up rooms being targeted for broadcasts in order to find all other rooms that match the target pattern.
  3. `wildCardIndicator: '*'`: String indicating what character(s) should be consisdered a "wildcard". Perhaps the default `*` is significant in your realm and you want to change it, and this is your way.
  4. `occupiedKey: '_o'`: String to be used internally by the wildcard plugin for managing which rooms and room paths are occupied. Perhaps in your world you will be naming rooms or sub-rooms `_o`, and this is your way to make that not screw up the wildcard internals by using something else.

## Tests

I have written some decent test coverage of the behavior. You can see it in `tests.js`, and run it via:
`npm test`

## License

(The MIT License)

Copyright (c) 2018 Christopher Newhouse &lt;c.newhouse@gmail.com&gt; and 2013 Jonathan Brumley &lt;cayasso@gmail.com&gt;

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
