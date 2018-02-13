/* global describe it */
'use strict';

const Adapter = require('../')
  , expect = require('expect.js');

let savedAdapter;
let expected = {};


describe('primus-rooms-reverse-wildcard-adapter', () => {

  it('should have required methods', () => {
    const adapter = new Adapter();
    expect(adapter.set).to.be.a('function');
    expect(adapter.get).to.be.a('function');
    expect(adapter.del).to.be.a('function');
    expect(adapter.broadcast).to.be.a('function');
    expect(adapter.clients).to.be.a('function');
    expect(adapter.empty).to.be.a('function');
    expect(adapter.isEmpty).to.be.a('function');
    expect(adapter.clear).to.be.a('function');
    expect(adapter.wildcard).to.be.an('object');
  });


  describe('Adapter#del', () => {
    it('should not leak memory', () => {
      const adapter = new Adapter();
      adapter.del('foo');
      expect(adapter.rooms).to.eql({});
      expect(adapter.sids).to.eql({});
    });
  });


  describe('Wildcard#clear', () => {
    const adapter = new Adapter();
    const wildcard = adapter.wildcard;

    it('should clear all the rooms', () => {
      adapter.set('foo', 'lobby');
      expect(wildcard.rooms).to.not.eql({});
      adapter.clear();
      expect(wildcard.rooms).to.eql({});
    });
  });


  describe('Wildcard#disabled', () => {
    const adapter = new Adapter({ wildcard: false });
    const wildcard = adapter.wildcard;

    it('should not add to rooms', () => {
      adapter.set('foo', 'lobby');
      expect(adapter.rooms).to.eql({lobby: {foo: true}});
      expect(wildcard.rooms).to.eql({});
    });

    it('should not match', () => {
      adapter.add('foo', '1_1:2_1');
      let wasCalled = false;
      wildcard.match('1_1:*', () => {
        wasCalled = true;
      });
      expect(wasCalled).to.equal(false);
    });
  });


  describe('Wildcard#add', () => {
    const adapter = new Adapter();
    const wildcard = adapter.wildcard;

    it('should perform a basic add', () => {
      adapter.set('foo', 'lobby');
      expected['lobby'] = {
        [wildcard.occupiedKey]: true
      };
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should not change when adding another client to same room', () => {
      adapter.set('bar', 'lobby');
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should perform a 2-level add', () => {
      adapter.set('foo', '1_1:2_1');
      expected['1_1'] = {
        ['2_1']: {
          [wildcard.occupiedKey]: true
        }
      };
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should add another level-2 entry', () => {
      adapter.set('foo', '1_1:2_2');
      expected['1_1']['2_2'] = {
        [wildcard.occupiedKey]: true
      };

      expect(wildcard.rooms).to.eql(expected);
    });

    it('should add a level-3 entry', () => {
      adapter.set('foo', '1_1:2_1:3_1');
      expected['1_1']['2_1']['3_1'] = {
        [wildcard.occupiedKey]: true
      };
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should perform a 3-level add', () => {
      adapter.set('foo', '1_2:2_1:3_1');
      expected['1_2'] = {
        '2_1': {
          '3_1': {
            [wildcard.occupiedKey]: true
          }
        }
      };
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should add a another level-3 entry', () => {
      adapter.set('foo', '1_2:2_2:3_1');
      expected['1_2']['2_2'] = {
        '3_1': {
          [wildcard.occupiedKey]: true
        }
      };
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should add a another level-3 entryyyy', () => {
      adapter.set('foo', '1_2:2_2:3_2');
      expected['1_2']['2_2']['3_2'] = { [wildcard.occupiedKey]: true};
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should add a level-2 entry to a 3-level branch', () => {
      adapter.set('foo', '1_2:2_1');
      expected['1_2']['2_1'][wildcard.occupiedKey] = true;
      expect(wildcard.rooms).to.eql(expected);
    });

    // SAVE THE ADAPTER FOR LATER
    savedAdapter = adapter;
  });


  describe('Wildcard#match', () => {
    let adapter = new Adapter();
    let wildcard = adapter.wildcard;

    it('should not match if no wildcard in room', () => {
      let wasCalled = false;
      wildcard.match('lobby', () => {
        wasCalled = true;
      });
      expect(wasCalled).to.equal(false);
    });

    it('should find the only 1st-level match', () => {
      adapter.set('foo', '1_1');
      let numTimesCalled = 0;
      let matchFound = false;
      wildcard.match('*', room => {
        numTimesCalled++;
        if (room === '1_1') matchFound = true;
      });
      expect(numTimesCalled).to.equal(1);
      expect(matchFound).to.equal(true);
    });

    it('should all 1st-level matches', () => {
      adapter.set('foo', '1_2');
      let numTimesCalled = 0;
      let matchesFound = 0;
      wildcard.match('*', room => {
        numTimesCalled++;
        if (['1_1', '1_2'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(2);
      expect(matchesFound).to.equal(2);
    });

    it('should not match a 2nd-level pattern that does not exist', () => {
      let numTimesCalled = 0;
      wildcard.match('sass:*', () => {
        numTimesCalled++;
      });
      expect(numTimesCalled).to.equal(0);
    });

    it('should load up saved adapter', () => {
      // RESTORE THE ADAPTER TO THE ONE WITH LOTS SET UP ON IT
      adapter = savedAdapter;
      wildcard = adapter.wildcard;
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should all 1st-level matches', () => {
      let numTimesCalled = 0;
      let matchesFound = 0;

      wildcard.match('*', room => {
        numTimesCalled++;
        if (['lobby', '1_1', '1_2'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(3);
      expect(matchesFound).to.equal(3);
    });

    it('should find up-to-2nd-level 1st-level matches', () => {
      let numTimesCalled = 0;
      let matchesFound = 0;

      wildcard.match('1_2:*', room => {
        numTimesCalled++;
        if (['1_2:2_1', '1_2:2_2'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(2);
      expect(matchesFound).to.equal(2);
    });

    it('should find up-to-2nd-level 2nd-level matches', () => {
      let numTimesCalled = 0;
      let matchesFound = 0;

      wildcard.match('*:2_1', room => {
        numTimesCalled++;
        if (['1_1:2_1', '1_2:2_1'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(2);
      expect(matchesFound).to.equal(2);
    });

    it('should find all 3rd-level matches', () => {
      let numTimesCalled = 0;
      let matchesFound = 0;

      wildcard.match('1_2:2_2:*', room => {
        numTimesCalled++;
        if (['1_2:2_2:3_1', '1_2:2_2:3_2'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(2);
      expect(matchesFound).to.equal(2);
    });

    it('should find all 2nd-level wildcard matches', () => {
      let numTimesCalled = 0;
      let matchesFound = 0;

      wildcard.match('1_2:*:3_1', room => {
        numTimesCalled++;
        if (['1_2:2_1:3_1', '1_2:2_2:3_1'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(2);
      expect(matchesFound).to.equal(2);
    });

    it('should find all 2nd and 3rd-level wildcard matches', () => {
      let numTimesCalled = 0;
      let matchesFound = 0;

      wildcard.match('1_2:*:*', room => {
        numTimesCalled++;
        if (['1_2:2_1:3_1', '1_2:2_2:3_1', '1_2:2_2:3_2'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(3);
      expect(matchesFound).to.equal(3);
    });

    it('should find all 1st and 3rd-level wildcard matches', () => {
      let numTimesCalled = 0;
      let matchesFound = 0;

      wildcard.match('*:2_2:*', room => {
        numTimesCalled++;
        if (['1_2:2_2:3_1', '1_2:2_2:3_2'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(2);
      expect(matchesFound).to.equal(2);
    });

    it('should find all 1st, 2nd and 3rd-level wildcard matches', () => {
      let numTimesCalled = 0;
      let matchesFound = 0;

      wildcard.match('*:*:*', room => {
        numTimesCalled++;
        if (['1_1:2_1:3_1', '1_2:2_1:3_1', '1_2:2_2:3_1', '1_2:2_2:3_2'].includes(room)) matchesFound++;
      });
      expect(numTimesCalled).to.equal(4);
      expect(matchesFound).to.equal(4);
    });

  });


  describe('Wildcard#remove', () => {
    let adapter = new Adapter();
    let wildcard = adapter.wildcard;

    it('should perform basic deletion', () => {
      adapter.set('foo', 'lobby');
      expect(wildcard.rooms).to.not.eql({});
      adapter.del('foo', 'lobby');
      expect(wildcard.rooms).to.eql({});
    });

    it('should load up saved adapter', () => {
      // RESTORE THE ADAPTER TO THE ONE WITH LOTS SET UP ON IT
      adapter = savedAdapter;
      wildcard = adapter.wildcard;

      expect(wildcard.rooms).to.eql(expected);
    });

    it('should not delete a basic room with more than 1 user in it', () => {
      // THERE IS A 2ND USER IN THERE OTHER THAN THIS
      adapter.del('bar', 'lobby');
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should perform a basic delete', () => {
      adapter.del('foo', 'lobby');
      delete expected['lobby'];
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should not perform a complex room delete with more than 1 user in it', () => {
      adapter.set('bar', '1_1:2_1');
      adapter.del('bar', '1_1:2_1');
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should mark mid-level room as unoccupied', () => {
      adapter.del('foo', '1_1:2_1');
      expect(expected['1_1']['2_1'][wildcard.occupiedKey]).to.equal(true);
      delete expected['1_1']['2_1'][wildcard.occupiedKey];

      expect(wildcard.rooms).to.eql(expected);
    });

    it('should remove a 3rd-level room completely', () => {
      adapter.del('foo', '1_2:2_1:3_1');
      expect(expected['1_2']['2_1']['3_1'][wildcard.occupiedKey]).to.equal(true);
      delete expected['1_2']['2_1']['3_1'];
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should remove a 2nd-level room completely', () => {
      adapter.del('foo', '1_1:2_2');
      expect(expected['1_1']['2_2'][wildcard.occupiedKey]).to.equal(true);
      delete expected['1_1']['2_2'];
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should remove a 2nd and 3rd level room completely', () => {
      expect(expected['1_2']['2_2']['3_1'][wildcard.occupiedKey]).to.equal(true);
      expect(expected['1_2']['2_2']['3_2'][wildcard.occupiedKey]).to.equal(true);

      adapter.del('foo', '1_2:2_2:3_1');
      delete expected['1_2']['2_2']['3_1'];
      expect(wildcard.rooms).to.eql(expected);

      adapter.del('foo', '1_2:2_2:3_2');
      delete expected['1_2']['2_2'];
      expect(wildcard.rooms).to.eql(expected);
    });

    it('should remove a 1st, 2nd and 3rd level room completely', () => {
      adapter.del('foo', '1_1:2_1:3_1');
      expect(expected['1_1']['2_1']['3_1'][wildcard.occupiedKey]).to.equal(true);
      delete expected['1_1'];

      expect(wildcard.rooms).to.eql(expected);
    });
  });
});


/*
AN EXAMPLE HIGH-WATER-MARK STATE:
{
  "lobby":{
    "_o":true
  },
  "1_1":{
    "2_1":{
      "_o":true,
      "3_1":{
        "_o":true
      }
    },
    "2_2":{
      "_o":true
    }
  },
  "1_2":{
    "2_1":{
      "3_1":{
        "_o":true
      },
      "_o":true
    },
    "2_2":{
      "3_1":{
        "_o":true
      }
    }
  }
}
*/