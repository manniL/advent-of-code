const R = require('ramda')
const { readFileAndSplitByLines } = require('../utils/fs.js')
const path = require('path')

const input = readFileAndSplitByLines(path.join(__dirname, './input.txt'))

const formatInput = R.map(
  R.pipe(
    R.match(/^Step (\w) .* step (\w) /),
    R.slice(1, 3),
  )
)

const sortAlphabetically = R.sort(R.comparator(R.lt))

// Lenses

const allLens = R.lensProp('all')
const todoLens = R.lensProp('todo')
const doneLens = R.lensProp('done')

// Tasks
const findStartTasks = R.pipe(
  R.transpose,
  R.apply(R.difference),
  sortAlphabetically
)

const allTasks = R.pipe(R.unnest, R.uniq)

const noTasksLeft = R.pipe(
  R.prop('todo'),
  R.isEmpty
)

const tasksWithFulfilledDependencies = state => {
  const tasksInQueue = R.view(todoLens)(state)
  return R.filter(R.pipe(
    R.map(collectDependencies(state.input)),
    R.unnest,
    R.map(R.flip(R.includes)(state.done)),
    R.all(R.equals(true)),
  ))(tasksInQueue)
}

const updateTodoTasks = state => {
  const tasksNotDoneYet = R.pipe(
    R.juxt([
      R.view(allLens),
      R.view(doneLens)
    ]),
    R.apply(R.difference)
  )(state)

  return R.set(todoLens, tasksNotDoneYet, state)
}

const createObject = R.applySpec({
  done: R.always([]),
  todo: allTasks,
  all: allTasks,
  input: R.identity,
  nextTasks: findStartTasks
})

const collectDependencies = input => letter => R.pipe(
  R.filter(R.pipe(R.last, R.equals(letter))),
  R.transpose,
  R.ifElse(R.isEmpty, R.identity, R.head),
  Array.from
)(input)

const process = state => {
  const nextTask = R.pipe(
    tasksWithFulfilledDependencies,
    sortAlphabetically,
    R.head
  )(state)

  const currentlyDone = R.view(doneLens, state)

  return R.pipe(
    R.set(doneLens, R.concat(currentlyDone, R.of(nextTask))),
    updateTodoTasks
  )(state)
}

const partOne = R.pipe(
  createObject,
  R.until(
    noTasksLeft,
    process
  ),
  R.prop('done'),
  R.join('')
)

// -----------------------------------------------------------------------------------

const createPartTwoObject = R.applySpec({
  input: R.identity,
  all: allTasks,
  done: R.always([]),
  todo: allTasks,
  workers: R.always([]),
  elapsed: R.always(-1) // Seconds are 0-based. Start with -1 as nothing happened on creation
})

const workersLens = R.lensProp('workers')

const allWorkersIdle = R.pipe(
  R.prop('workers'),
  R.isEmpty
)

const evolveWorker = R.evolve({
  remaining: R.dec
})

const increaseTime = R.evolve({
  workers: R.map(evolveWorker),
  elapsed: R.inc
})

const removeDoneTasksFromWorkers = state => {
  const workers = R.view(workersLens)(state)
  const done = R.view(doneLens)(state)

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
    R.set(workersLens, unfinishedTasks),
    R.set(doneLens, doneTasks)
  )(state)
}

const updateTodoTasksWithWorkers = state => {
  const [done, workers, all] = R.juxt([
    R.view(doneLens),
    R.view(workersLens),
    R.view(allLens)
  ])(state)

  const inProgress = R.concat(R.pluck('letter', workers), done)
  return R.set(todoLens, R.difference(all, inProgress))(state)
}

const MAX_NUMBER_OF_WORKERS = 5
const CHAR_CODE_A = 65
const BASE_DURATION = 60

const notMoreThanMaxWorkers = R.pipe(R.length, R.gt(MAX_NUMBER_OF_WORKERS))

const assignNewTaskToWorkers = state => {
  const workers = R.view(workersLens)(state)
  if (!notMoreThanMaxWorkers(workers)) {
    return state
  }
  const eligibleTasks = R.pipe(
    tasksWithFulfilledDependencies,
    sortAlphabetically,
    R.map(letterToTaskWithTime),
  )(state)

  const freeWorkers = MAX_NUMBER_OF_WORKERS - R.length(workers)
  return R.set(workersLens, R.concat(workers, R.take(freeWorkers, eligibleTasks)))(state)
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
  updateTodoTasksWithWorkers,
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
