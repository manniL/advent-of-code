const R = require('ramda')
const { readFileAndSplitByLines } = require('../utils/fs.js')
const path = require('path')

const lines = readFileAndSplitByLines(path.join(__dirname, './input.txt'))

const getRulesObject = R.pipe(
  R.drop(2),
  R.map(R.split(' => ')),
)

const getInitialPlantsState = R.pipe(
  R.head,
  R.match(/initial state: (.+)/),
  R.nth(1),
)

const guardStateWithEmptyPlaces = paddingSize => state => '.'.repeat(paddingSize) + state + '.'.repeat(paddingSize)

const PADDING_SIZE = 4

const guardStateWithEmptyPlacesWithPaddingSize = guardStateWithEmptyPlaces(PADDING_SIZE)

const stringBeforeResult = i => s => s.substring(0, i + 2)
const stringAfterResult = i => s => s.substring(i + 3)

const potIsPresent = R.pipe(R.last, R.equals('#'))

const normalizePotIndex = initialPotIndex => R.pipe(R.head, R.flip(R.subtract)(initialPotIndex))

const plantsLens = R.lensProp('plants')
const potIndexLens = R.lensProp('potIndex')

const prepareStateObject = R.pipe(
  R.over(plantsLens, guardStateWithEmptyPlacesWithPaddingSize),
  R.over(potIndexLens, R.add(4)),
)

const createEmptyPlantRow = R.replace(/#/g, '.')

const reducePlants = (plants => R.reduce(
  (nextState, [rule, result]) => R.reduce(
    (nextState, i) => {
      if (plants.substr(i, 5) !== rule) {
        return nextState
      }
      return stringBeforeResult(i)(nextState) + result + stringAfterResult(i)(nextState)
    },
    nextState,
    R.range(0, plants.length - PADDING_SIZE)
  ),
  createEmptyPlantRow(plants),
  getRulesObject(lines)
))

const evolvePlants = R.reduce(
  R.pipe(
    prepareStateObject,
    R.over(plantsLens, reducePlants)
  )
)

const createInitialStateObject = R.applySpec({ potIndex: R.always(0), plants: getInitialPlantsState })

const runGenerations = (generationsCount) => {
  const countRange = R.range(0, generationsCount)

  const finalState = evolvePlants(createInitialStateObject(lines), countRange)

  return R.pipe(
    R.split(''),
    R.toPairs,
    R.filter(potIsPresent),
    R.map(normalizePotIndex((finalState.potIndex))),
    R.sum
  )(finalState.plants)
}

console.log('Part 1', runGenerations(20))

const STABLE_AFTER = 200

const calculateResult = stabilityFactor => multiplicator => runGenerations(stabilityFactor) + (5E10 - stabilityFactor) * multiplicator
const calculateMultiplicator = stabilityFactor => runGenerations(stabilityFactor + 1) - runGenerations(stabilityFactor)

const partTwo = stabilityFactor => R.pipe(
  calculateMultiplicator,
  calculateResult(stabilityFactor),
  R.tap(result => console.log('Part 2', result))
)(stabilityFactor)

partTwo(STABLE_AFTER)
