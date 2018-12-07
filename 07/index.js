const R = require('ramda')
const {readFileAndSplitByLines} = require('../utils/fs.js')
const path = require('path')

const input = readFileAndSplitByLines(path.join(__dirname, './input.txt'))

const formatInput = R.map(
  R.pipe(
    R.match(/^Step (\w) .* step (\w) /),
    R.slice(1, 3),
    // R.zipObj(['prev', 'next'])
  )
)

const sortAlphabetically = R.sort(R.comparator(R.lt))

const findStartTasks = R.pipe(
  R.transpose,
  R.apply(R.difference),
  sortAlphabetically
)

/*
Get start letter
Collect dependants
For subsequent tasks:
  * collect dependencies
  * Already fulfilled?
  * If so, add to string and get dependants
  * If not
 */

const createObject = R.applySpec({
  order: R.always(''),
  input: R.identity
})

const evolve = (state) => {
  if (!state.order) {
    state.nextTasks = findStartTasks(state.input)
  }
  if (R.either(R.isEmpty, R.isNil)(state.nextTasks)) {
    return state.order
  }
  const nextTaskToAdd = R.pipe(filteredDependencies, R.head)(state)
  if (!nextTaskToAdd) {
    return state.order
  }
  state.order += nextTaskToAdd
  state.nextTasks = R.pipe(
    R.without(R.split('', state.order)),
    R.concat(collectDependants(nextTaskToAdd)(state.input)),
    Array.from,
    sortAlphabetically,
  )(state.nextTasks)
  return evolve(state)
}

const includesNot = R.complement(R.flip(R.includes))

const filteredDependencies = state => R.pipe(
  R.filter(
    R.both(
      dependenciesFulfilled(state),
      includesNot(state.order)
    ),
  ),
  sortAlphabetically
)(state.nextTasks)

const dependenciesFulfilled = ({order, input}) => R.pipe(
  R.map(collectDependencies(input)),
  R.unnest,
  R.map(R.flip(R.includes)(order)),
  R.all(R.equals(true)),
)

const collectDependants = letter => R.pipe(
  R.filter(R.pipe(R.head, R.equals(letter))),
  R.transpose,
  R.ifElse(R.isEmpty, R.identity, R.last),
  Array.from,
)

const collectDependencies = input => letter => R.pipe(
  R.filter(R.pipe(R.last, R.equals(letter))),
  R.transpose,
  R.ifElse(R.isEmpty, R.identity, R.head),
  Array.from
)(input)


const partOne = R.pipe(
  createObject,
  evolve
)

// Sorry for the ugliness. Will clean up "later"
console.log('Part 1:', partOne(formatInput(input)))
