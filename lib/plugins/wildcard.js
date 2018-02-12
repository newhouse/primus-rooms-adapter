'use strict';

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

  var wildcard = {};

  /**
   * Hold Wildcard enable.
   *
   * @typem {Boolean}
   * @api public
   */

  wildcard.enabled = 'enabled' in options
    ? options.enabled : true;

  /**
   * Match rooms with wildcards.
   *
   * @param {String} room
   * @param {Function} fn
   * @api public
   */

  wildcard.match = function match(target, rooms, fn) {
    // If wildcard is not enabled OR if the target room
    // does not contain a wildcard character: do nothing.
    if (!wildcard.enabled || target.indexOf('*') === -1) return;

    // Compile the RegEx to be used.
    var regx = regex(target);

    // Go through every room name.
    for (var room in rooms) {
      // If this room matches, then call the fn with that room.
      if (regx.test(room)) fn(room);
    }
  };

  /**
   * Wild card regular expresion builder.
   *
   * @param {String} pattern
   * @param {RegEx}
   * @api private
   */

  function regex(pattern) {
    pattern = pattern.replace(/[\*]/g, '(.*?)');
    return new RegExp('^' + pattern + '$');
  }

  // Expose wildcard namespace.
  adapter.wildcard = wildcard;
  return wildcard;
}
