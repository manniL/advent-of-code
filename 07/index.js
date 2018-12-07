const R = require('ramda')
const {readFileAndSplitByLines} = require('../utils/fs.js')
const path = require('path')

const input = readFileAndSplitByLines(path.join(__dirname, './input.txt'))

const formatInput = R.map(
  R.pipe(
    R.match(/^Step (\w) .* step (\w) /),
    R.slice(1, 3),
  )
)

const sortAlphabetically = R.sort(R.comparator(R.lt))

const findStartTasks = R.pipe(
  R.view(R.lensProp('input')),
  R.transpose,
  R.apply(R.difference),
  sortAlphabetically
)

const createObject = R.applySpec({
  order: R.always(''),
  input: R.identity
})

const evolve = (state) => {
  if (!state.order) {
    state.nextTasks = findStartTasks(state)
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
  R.view(R.lensProp('nextTasks')),
  R.filter(
    R.both(
      dependenciesFulfilled(state),
      includesNot(state.order)
    ),
  ),
  sortAlphabetically
)(state)

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

const allTasks = R.pipe(R.unnest, R.uniq)

const createPartTwoObject = R.applySpec({
  input: R.identity,
  allTasks,
  done: R.always([]),
  todo: allTasks,
  workers: R.always([]),
  elapsed: R.always(-1) // Seconds are 0-based. Start with -1 as nothing happened on creation
})

const workersLense = R.lensProp('workers')
const allTasksLense = R.lensProp('allTasks')
const todoLense = R.lensProp('todo')
const doneLense = R.lensProp('done')

const noTasksLeft = R.pipe(
  R.prop('todo'),
  R.length,
  R.equals(0)
)
const allWorkersIdle = R.pipe(
  R.prop('workers'),
  R.length,
  R.equals(0)
)

const evolveWorker = R.evolve({
  remaining: R.dec
})

const increaseTime = R.evolve({
  workers: R.map(evolveWorker),
  elapsed: R.inc
})

const removeDoneTasksFromWorkers = state => {
  const workers = R.view(workersLense)(state)
  const done = R.view(doneLense)(state)

  const hasNoSecondsRemaining = R.pipe(
    R.prop('remaining'),
    R.equals(0)
  )

  const [finishedTaskLetters, unfinishedTasks] = R.juxt([
    R.pipe(
      R.filter(hasNoSecondsRemaining),
      R.pluck('letter')
    ),
    R.reject(hasNoSecondsRemaining)])(workers)

  const doneTasks = R.concat(finishedTaskLetters, done)

  return R.pipe(
    R.set(workersLense, unfinishedTasks),
    R.set(doneLense, doneTasks)
  )(state)
}

const updateTodoTasks = state => {
  const [done, workers, all] = R.juxt([
    R.view(doneLense),
    R.view(workersLense),
    R.view(allTasksLense)
  ])(state)

  const inProgress = R.concat(R.pluck('letter', workers), done)

  return R.set(todoLense, R.difference(all, inProgress))(state)
}

const MAX_NUMBER_OF_WORKERS = 5
const CHAR_CODE_A = 65
const BASE_DURATION = 60

const notMoreThanMaxWorkers = R.pipe(R.length, R.gt(MAX_NUMBER_OF_WORKERS))

const tasksWithFulfilledDependencies = state => {
  const tasksInQueue = R.view(todoLense)(state)
  return R.filter(R.pipe(
    R.map(collectDependencies(state.input)),
    R.unnest,
    R.map(R.flip(R.includes)(state.done)),
    R.all(R.equals(true)),
  ))(tasksInQueue)
}

const assignNewTaskToWorkers = state => {
  const workers = R.view(workersLense)(state)
  if (!notMoreThanMaxWorkers(workers)) {
    return state
  }
  const eligibleTasks = R.pipe(
    tasksWithFulfilledDependencies,
    sortAlphabetically,
    R.map(letterToTaskWithTime),
  )(state)

  const freeWorkers = MAX_NUMBER_OF_WORKERS - R.length(workers)
  return R.set(workersLense, R.concat(workers, R.take(freeWorkers, eligibleTasks)))(state)
}

const charCodeFromLetter = a => a.charCodeAt(0)

const getTimeFromCharCode = R.pipe(
  charCodeFromLetter,
  R.flip(R.subtract)(CHAR_CODE_A),
  // Start with one
  R.inc,
  R.add(BASE_DURATION)
)

const letterToTaskWithTime = R.applySpec({
  letter: R.identity,
  remaining: getTimeFromCharCode
})

const fullSolutionPresent = R.both(noTasksLeft, allWorkersIdle)
const doWork = R.pipe(
  removeDoneTasksFromWorkers,
  updateTodoTasks,
  assignNewTaskToWorkers,
  increaseTime,
)

const partTwo = R.pipe(
  createPartTwoObject,
  R.until(
    fullSolutionPresent,
    doWork
  ),
  R.prop('elapsed'),
)

// Sorry for the ugliness. Will clean up "later"
console.log('Part 1:', partOne(formatInput(input)))
console.log('Part 2:', partTwo(formatInput(input)))
