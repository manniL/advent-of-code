const R = require('ramda')
const {readFileAndSplitByLines} = require('../utils/fs.js')
const path = require('path')

const dateFns = require('date-fns')
const splitWith = require('../utils/splitWith')

const dateComparator = (a, b) => dateFns.compareAsc(a.date, b.date)
const transformToObject = str => {
  const [, dateString, action] = R.match(/\[(.*)] (.*)/, str)
  const date = dateFns.parse(dateString)
  return {
    date,
    action
  }
}

const guardSleepTimePairs = input => {
  // Split by "begin shift" records
  // Result is the interval for that specific guard
  const [intervals, shifts] = R.juxt([
    splitWith(R.pipe(R.prop('action'), isShiftAction)),
    R.pipe(
      R.pluck('action'),
      R.aperture(2),
      R.reduce(ignoreCleanShifts, []),
      R.map(R.match(/(\d+)/g)),
      R.unnest
    )
  ])(input)

  // Merge intervals by creating pairs and resolve them
  const calculateSleepTimes = R.map(
    R.pipe(
      R.splitEvery(2),
      R.map(([asleep, wakeup]) => R.range(dateFns.getMinutes(asleep.date), dateFns.getMinutes(wakeup.date))),
      R.unnest
    )
  )
  const zipShiftsAndSleepTimes = R.zip(shifts)

  const mergeTimes = R.reduce((idMap, [id, minutes]) => {
    const newValue = idMap.has(id) ? idMap.get(id).concat(minutes) : minutes
    idMap.set(id, newValue)
    return idMap
  }, new Map)

  const toArray = x => Array.from(x)

  return R.pipe(
    calculateSleepTimes,
    zipShiftsAndSleepTimes,
    mergeTimes,
    toArray
  )(intervals)
}

const partOne = input => {
  const dedupedPairs = guardSleepTimePairs(input)
  const [id, minutesAsleep] = mostMinutesAsleep(dedupedPairs)

  const minute = R.head(minuteMostOftenAsleep(minutesAsleep))
  return {id, minute, result: id * minute}
}

const partTwo = R.pipe(
  guardSleepTimePairs,
  R.map(([id, minutes]) => [id, minuteMostOftenAsleep(minutes)]),
  R.reduce(R.maxBy(([, [minute, timesAsleepThere]]) => timesAsleepThere), [0, [0, 0]]),
  ([id, [minute]]) => ({id, minute, result: id * minute})
)

const isShiftAction = R.test(/shift/)

const mostMinutesAsleep = R.reduce(R.maxBy(([, minutes]) => minutes.length), [0, []])

const minuteMostOftenAsleep = R.pipe(R.countBy(Number), R.toPairs, R.reduce(R.maxBy(([k, v]) => Number(v)), [0, 0]))

const ignoreCleanShifts = (shifts, [actionOne, actionTwo]) => {
  if (isShiftAction(actionOne) && !isShiftAction(actionTwo)) {
    shifts.push(actionOne)
  }
  return shifts
}

const input = readFileAndSplitByLines(path.join(__dirname, './input.txt'))

const formatInput = R.pipe(R.map(transformToObject), R.sort(dateComparator))
const formattedInput = formatInput(input)
console.log('Part 1:', partOne(formattedInput))
console.log('Part 2:', partTwo(formattedInput))
