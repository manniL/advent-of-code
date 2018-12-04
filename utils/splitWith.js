const _curry2 = require('ramda/src/internal/_curry2')

/* From https://github.com/ramda/ramda/blob/a74f3d173e1e6f658bfaf63751afc8d828f5b552/source/splitWith.js */

/**
 * Takes a list and a predicate and returns a list of lists split by matches
 *
 * @func
 * @memberOf R
 * @since v0.25.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [[a]]
 * @param {Function} pred The predicate that determines where the array is split.
 * @param {Array} list The array to be split.
 * @return {Array}
 * @example
 *
 *      R.splitWith(R.equals(2), [1, 2, 3, 4, 2, 1]); //=> [[1], [3, 4], [1]];
 *      R.splitWith(R.equals('a'), ['b','a','n','a','n','a','s']); //=> [['b'],['n'],['n'],['s']]
 */
const splitWith = _curry2(function splitWith (pred, list) {
  let idx = 0
  const len = list.length
  let ret = []
  while (idx < len) {
    let entry = []
    while (idx < len && !pred(list[idx])) {
      entry = entry.concat(list[idx])
      idx += 1
    }
    ret = entry.length ? ret.concat([entry]) : ret
    idx += 1
  }
  return ret
})

module.exports = splitWith
