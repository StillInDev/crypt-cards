// Map rule: a room need not lead on to its area's boss, but if it cannot, it must hold a hero or power.
const assert = require('assert');
const DC = require('../src/js/engine.js');
const door = { kind: 'door' }, pw = { kind: 'power', id: 'heal' };
const room = (from, reward, area) => ({ from, reward: reward || door, area: area || 1 });

// A straight line: everything leads to the boss (the last room).
assert.deepStrictEqual(DC.mapDeadEnds([room([0]), room([1]), room([2])]), []);
// A side room off the first room that leads nowhere, with no reward: broken.
assert.deepStrictEqual(DC.mapDeadEnds([room([0]), room([1]), room([1]), room([2])]), [2]);
// The same side room holding a power: allowed.
assert.deepStrictEqual(DC.mapDeadEnds([room([0]), room([1]), room([1], pw), room([2])]), []);
// A hero counts too.
assert.deepStrictEqual(DC.mapDeadEnds([room([0]), room([1], { kind: 'hero', id: 'bard' }), room([1])]), []);
// Each area is checked against its own boss: area 2's side room is a dead end even though area 1's boss exists.
assert.deepStrictEqual(DC.mapDeadEnds([room([0]), room([1]), room([0], null, 2), room([3], null, 2), room([3], null, 2)]), [3]);
// A room with two ways in still leads on if either path does.
assert.deepStrictEqual(DC.mapDeadEnds([room([0]), room([1]), room([1]), room([2, 3])]), []);
