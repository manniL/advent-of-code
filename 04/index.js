const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const dateFns = require('date-fns')
const splitWith = require('../utils/splitWith')

const run = async () => {
  const input = await readFile(path.join(__dirname, './input.txt'), 'utf-8')
  const formattedInput = formatInput(input)
  console.log(splitWith(a => a === 1, [1, 2, 1, 1, 1, 3]))
  console.log('Part 1:', partOne(formattedInput))
}

run()

const dateComparator = (a, b) => dateFns.compareAsc(a.date, b.date)
const transformToObject = str => {
  const [, dateString, action] = R.match(/\[(.*)] (.*)/, str)
  const date = dateFns.parse(dateString)
  return {
    date,
    action
  }
}

const partOne = input => {
  // Split by "begin shift" records
  // Result is the interval for that specific guard
  const intervals = splitWith(({action}) => isShiftAction(action), input)
  const shifts = R.pipe(
    R.pluck('action'),
    R.aperture(2),
    R.reduce(onlyShiftsWithSleep, []),
    R.map(R.match(/(\d+)/g)),
    R.unnest
  )(input)
  // Merge intervals by creating pairs and resolve them
  const sleepTimes = R.map(
    R.pipe(
      R.splitEvery(2),
      R.map(([asleep, wakeup]) => R.range(dateFns.getMinutes(asleep.date), dateFns.getMinutes(wakeup.date))),
      R.unnest
    )
  )(intervals)
  // 1:1 mapping -> zip
  const zippedPairs = R.zip(shifts, sleepTimes)
  // Merge duplicates ;)
  const dedupedPairs = R.reduce((idMap, [id, minutes]) => {
    const newValue = idMap.has(id) ? idMap.get(id).concat(minutes) : minutes
    idMap.set(id, newValue)
    return idMap
  }, new Map)(zippedPairs)

  const [id, minutesAsleep] = mostMinutesAsleep(Array.from(dedupedPairs))

  const minute = minuteMostOftenAsleep(minutesAsleep)
  return {id, minute, result: id * minute}
}

const isShiftAction = R.test(/shift/)

const mostMinutesAsleep = R.reduce(R.maxBy(([, minutes]) => minutes.length), [0, []])
const formatInput = R.pipe(R.split('\n'), R.dropLast(1), R.map(transformToObject), R.sort(dateComparator))

const minuteMostOftenAsleep = R.pipe(R.countBy(Number), R.toPairs, R.reduce(R.maxBy(([k, v]) => Number(v)), [0, 0]), R.head)

const onlyShiftsWithSleep = (shifts, [actionOne, actionTwo]) => {
  if (isShiftAction(actionOne) && !isShiftAction(actionTwo)) {
    shifts.push(actionOne)
  }
  return shifts
}
