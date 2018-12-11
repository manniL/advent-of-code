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

  const intervalsToRange = R.pipe(
    R.pluck('date'),
    R.map(dateFns.getMinutes),
    R.apply(R.range),
  )

  // Merge intervals by creating pairs and resolve them
  const calculateSleepTimes = R.map(
    R.pipe(
      R.splitEvery(2),
      R.map(intervalsToRange),
      R.unnest
    )
  )
  const zipShiftsAndSleepTimes = R.zip(shifts)

  const mergeTimes = R.reduce((idMap, [id, minutes]) => {
    const newValue = idMap.has(id) ? idMap.get(id).concat(minutes) : minutes
    idMap.set(id, newValue)
    return idMap
  }, new Map)

  return R.pipe(
    calculateSleepTimes,
    zipShiftsAndSleepTimes,
    mergeTimes,
    Array.from
  )(intervals)
}

const mostMinutesAsleep = R.reduce(R.maxBy(R.pipe(R.last, R.length)), [0, []])

const minuteMostOftenAsleep = R.pipe(R.countBy(Number), R.toPairs, R.reduce(R.maxBy(([k, v]) => Number(v)), [0, 0]))

const partOne = input => {
  const [id, minutesAsleep] = R.pipe(
    guardSleepTimePairs,
    mostMinutesAsleep
  )(input)

  const minute = R.pipe(minuteMostOftenAsleep, R.head)(minutesAsleep)

  return {id, minute, result: id * minute}
}

const timeAsleep = R.pipe(R.last, R.last)
const minuteLens = R.lensIndex(1)
const partTwo = R.pipe(
  guardSleepTimePairs,
  R.map(R.over(minuteLens, minuteMostOftenAsleep)),
  R.reduce(R.maxBy(timeAsleep), [0, [0]]),
  ([id, [minute]]) => ({id, minute, result: id * minute})
)

const isShiftAction = R.test(/shift/)

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
