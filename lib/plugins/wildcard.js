'use strict';

var DEFAULT_DELIMITTER = ':';
var DEFAULT_WILDCARD_INDICATOR = '*';
var DEFAULT_OCCUPIED_KEY = '_o';

function log() {
  if(false) {
    console.log(...arguments);
  }
}

/**
 * Module exports.
 */

module.exports = plugin;

/**
 * Wildcard plugin.
 *
 * @param {Adapter} adapter
 * @param {Object} options
 * @return {Object}
 * @api public
 */

function plugin(adapter, options) {

  // Make sure we have a adapter.
  adapter = adapter || {};
  options = options || {};

  /**
   * Main wildcard namespace.
   *
   * @type {Object} obj
   * @api public
   */

  var wildcard = {
    rooms: {}
  };


  /**
   * Hold Wildcard enable.
   *
   * @typem {Boolean}
   * @api public
   */

  wildcard.enabled = 'enabled' in options
    ? options.enabled : true;

  wildcard.delimitter = 'delimitter' in options
    ? options.delimitter : DEFAULT_DELIMITTER;

  wildcard.occupiedKey = 'occupiedKey' in options
    ? options.occupiedKey : DEFAULT_OCCUPIED_KEY;

  wildcard.wildCardIndicator = 'wildCardIndicator' in options
    ? options.wildCardIndicator : DEFAULT_WILDCARD_INDICATOR;


  // SPLIT UP THE ROOM STRING INTO PATH PIECES
  wildcard.splitRoom = function splitRoom(room) {
    return (room && room.split(this.delimitter)) || [];
  };


  wildcard.getCursor = function getCursor(paths = []) {
    var cursor = this.rooms;
    paths.forEach(path => {
      cursor = cursor[path];
    });

    return cursor;
  };


  wildcard.match = function match(target, fn) {
    // IF WILDCARD IS NOT ENABLED, OR THERE IS NO WILDCARD IN THIS ROOM TARGET
    // THEN BE DONE
    if (!this.enabled || target.indexOf('*') === -1) return;

    var targetPaths = this.splitRoom(target);
    var targetPathsLength = targetPaths.length || 0;
    var targetPathPiece;
    var shouldBreak = false;
    var isLast;

    // THE ACCUMULATED PATHS STARTS OUT AS AN ARRAY WITH THE ONLY ELEMENT BEING AN EMPTY ARRAY
    var accumulatedPaths = [[]];
    var accumulatedPathsLength;
    var matchingRooms = [];

    // GO THROUGH EACH OF THE TARGET PATHS
    // outerLoop:
    for (var i=0; i < targetPathsLength; i++) {
      // WHAT PIECE ARE WE TARGETING THIS GO-ROUND?
      targetPathPiece = targetPaths[i];
      // IS THIS THE LAST PIECE OF THE TARGETING?
      isLast = (i + 1) === targetPathsLength;




      // IF IT'S A WILDCARD PIECE
      if (targetPathPiece === this.wildCardIndicator) {

        // FIGURE OUT THE LENGTH OF THE ACCUMLATED PATHS AT THE MOMENT
        accumulatedPathsLength = accumulatedPaths.length;

        // WE'RE GOING TO MAKE SOME NEW ACCUMUALTED PATHS BY CROSSING THE CURSOR'S
        // KEYS WITH THE EXISTING ACCUMLATED PATHS
        var newAccumulatedPaths = [];

        // GO THROUGH EACH ACCUMULATED PATH SO FAR
        for (var k=0; k < accumulatedPathsLength; k++) {
          // GET THE CURRENT ONE
          var accumulatedPath = accumulatedPaths[k];

          // GET A CURSOR TO THAT SPOT
          var cursor = this.getCursor(accumulatedPath);

          var cursorKeys = Object.keys(cursor);
          var cursorKeysLength = cursorKeys.length;

          // FOR EVERY KEY IN THE CURSOR...
          for (var l=0; l < cursorKeysLength; l++) {
            // GET THE CURSOR KEY WE'RE DEALING WITH
            var cursorKey = cursorKeys[l];
            // IF THIS KEY IS THE OCCUPIED MARKER, THEN SKIP IT
            if (cursorKey === this.occupiedKey) continue;
            // ADD THIS CURSOR KEY TO A COPY OF THE PREVIOUS ACCUMULATED PATH
            var newAccumulatedPath = accumulatedPath.concat(cursorKey);
            // PUSH THIS NEW ACCUMULATED PATH TO THE ARRAY OF ALL NEW ACCUMULATED PATHS
            newAccumulatedPaths.push(newAccumulatedPath);
            // IF THIS WAS ALSO THE LAST KEY, ADD IT AS A ROOM THAT MATCHES
            if (isLast) {
              // COMBINE THE PATH ACCUMULATOR TO CREATE THE MATCHING ROOM ID
              // AND PASS IT DIRECTLY TO THE CALLBACK
              fn(newAccumulatedPath.join(this.delimitter));
            }
          }

          // DEREF THE PREVIOUSLY ACCUMULATED PATH
          accumulatedPath = undefined;
        }

        // REPLACE THE ACCUMUULATED PATHS WITH THE NEW ACCUMULATED PATHS
        accumulatedPaths = newAccumulatedPaths;

        // GO ON TO THE NEXT OUTER LOOP
        continue;
      }




      else {

        // OK THIS WAS NOT A WILDCARD

        // FIGURE OUT THE LENGTH OF THE ACCUMLATED PATHS AT THE MOMENT
        accumulatedPathsLength = accumulatedPaths.length;

        // GO THROUGH EVERY ACCUMULATED PATH
        for (var j=0; j < accumulatedPathsLength; j++) {
          // GET THE CURRENT ONE
          accumulatedPath = accumulatedPaths[j];
          // GET A CURSOR TO THAT SPOT
          cursor = this.getCursor(accumulatedPath);

          // IF THE PATH LEADS HERE AT ALL
          if (cursor[targetPathPiece]) {

            // ADD THIS TARGET PIECE TO THE ACCUMULATED PATH
            accumulatedPath.push(targetPathPiece);

            // IF WE ARE ON THE LAST ONE IN THE TARGETING CHAIN
            if (isLast) {
              // COMBINE THE PATH ACCUMULATOR TO CREATE THE MATCHING ROOM ID
              // AND PASS IT DIRECTLY TO THE CALLBACK
              fn(accumulatedPath.join(this.delimitter));
            }

            continue;
          }

          // OK, WE'VE FALLEN THROUGH THE LOOP AND THAT PROBABLY MEANS
          // THAT WE'VE GOT AN EARLY-LEVEL WILDCARD THAT'S NOT BEING
          // SATISFIED HERE IN THIS LATER LEVEL
          // console.log('\n\n\n\nFELL THROUGH THE LOOP\n\n');
          // console.log({targetPathPiece, accumulatedPath, cursor});
          // console.log({accumulatedPaths});

          // LET'S GET RID OF THIS SET OF ACCUMULATE PATHS COMPLETELY
          accumulatedPaths.splice(j, 1);
          // THEN DECREMENT THE COUNTER BY ONE
          j--;
          // AND DECREMENT THE ASSUMED LENGTH BY ONE
          accumulatedPathsLength--;
          // console.log({accumulatedPaths});
          continue;

          // IF WE GOT HERE, SOMETHING IS WRONG SO BREAK HERE AND INDICATE
          // THAT WE SHOULD BREAK ALL THE WAY OUT Of THESE LOOPS
          // shouldBreak = true;
          // break outerLoop;
        }
      }

      // HAS SOMETHING GONE WRONG? SHOULD WE BREAK?
      if (shouldBreak) {
        console.log('\n\n\n\nSHOULD HAVE BROKEN\n\n');
        break;
      }
    }

    log({accumulatedPaths});
  };



  // ADD A ROOM
  wildcard.add = function add(room) {
    // IF WILDCARD IS NOT ENABLED, THEN DO NOTHING
    if (!this.enabled) return;

    // SPLIT THE KEYS
    var keys = this.splitRoom(room);
    var keysLength = keys.length;
    var key;
    var cursor = this.rooms;
    // var finalKey;
    var finalCursor;

    for (var i=0; i < keysLength; i++) {
      key = keys[i];
      // finalKey = key;
      finalCursor = cursor;
      cursor = cursor[key] = cursor[key] || {};
    }

    // MARK THIS ROOM AS OCCUPIED VS JUST A PATH ON THE CHAIN
    finalCursor[key][this.occupiedKey] = true;
    log('rooms OUT:', JSON.stringify(this.rooms));
  };







  // REMOVE A ROOM
  wildcard.remove = function remove(room) {

    if (!this.enabled) return;

    // log('removing room:', room);
    // console.log('rooms IN:', JSON.stringify(rooms));

    var keys = this.splitRoom(room);
    var keysLength = keys.length;
    var key;
    var isLast;

    var cursor = this.rooms;
    var cursors = [];


    // GO THROUGH THE PATH, BUILDING UP THE CURSORS, AND THEN REMOVE THE OCCUPIED
    // FLAG FROM THE END OF THE PATH
    for (var i=0; i < keysLength; i++) {
      key = keys[i];

      isLast = (i + 1) === keysLength;

      if (!(cursor && cursor[key])) {
        break;
      }

      if (isLast) {
        delete cursor[key][this.occupiedKey];
        cursors.push(cursor);
      }
      else {
        cursors.push(cursor);
        cursor = cursor[key];
      }
    }


    // console.log('cursors:', JSON.stringify(cursors));

    var cursorsLength = cursors.length;
    // console.log('cursorsLength', cursorsLength);

    // GO THROUGH THE CURSORS IN REVERSE
    for (i = cursorsLength - 1; i >= 0; i--) {
      cursor = cursors[i];

      // console.log('i:', i);
      // console.log('cursor:', cursor);

      Object.keys(cursor).forEach(key => {
        // IF THIS IS THE OCCUPIED KEY, DON'T WORRY ABOUT IT
        if (key === this.occupiedKey) return;

        if (cursor[key] && Object.keys(cursor[key]).length === 0) {
          // console.log('we should prune this one', key);
          delete cursor[key];
        }
      });
    }

    log('rooms OUT:', JSON.stringify(this.rooms));
  };




  wildcard.clear = function clear() {
    this.rooms = {};
  };


  /**
   * Wild card regular expresion builder.
   *
   * @param {String} pattern
   * @param {RegEx}
   * @api private
   */

  // function regex(pattern) {
  //   pattern = pattern.replace(/[\*]/g, '(.*?)');
  //   return new RegExp('^' + pattern + '$');
  // }

  // Expose wildcard namespace.
  adapter.wildcard = wildcard;
  return wildcard;
}
