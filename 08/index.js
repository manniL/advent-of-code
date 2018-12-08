const R = require('ramda')
const { readFile } = require('../utils/fs.js')
const path = require('path')

const input = readFile(path.join(__dirname, './input.txt'))

const formatInput = R.pipe(R.split(' '), R.map(Number))

// Lenses

const nodesLens = R.lensProp('nodes')
const treeLens = R.lensProp('tree')
const totalLens = R.lensProp('total')
const shouldAdvanceLens = R.lensProp('shouldAdvance')

const createObject = R.applySpec({
  tree: R.identity,
  nodes: R.always([]),
  total: R.always(0)
})

const retrieveNextNode = state => {
  const [childrenCount, metadataCount] = R.view(treeLens, state)
  const newNode = { childrenCount, metadataCount, values: [] }

  return R.pipe(
    R.over(treeLens, R.drop(2)),
    R.over(nodesLens, R.append(newNode)),
    R.set(shouldAdvanceLens, false)
  )(state)
}

const processNodes = state => {
  let node = R.last(R.view(nodesLens, state))

  if (node.childrenCount === 0) {
    const metadata = R.take(node.metadataCount, R.view(treeLens)(state))

    return R.pipe(
      R.over(nodesLens, R.drop(1)),
      R.over(treeLens, R.drop(node.metadataCount)),
      R.over(totalLens, R.add(R.sum(metadata)))
    )(state)
  }

  return R.pipe(
    R.over(nodesLens, R.drop(1)),
    R.over(nodesLens, R.append(R.evolve({ childrenCount: R.dec }, node))),
    R.set(shouldAdvanceLens, true)
  )(state)
}

const processKnownNodes = R.until(
  R.either(
    R.pipe(R.prop('nodes'), R.isEmpty),
    R.pipe(R.prop('shouldAdvance'), R.equals(true)),
  ),
  processNodes
)

const isTreeEmpty = R.pipe(R.prop('tree'), R.isEmpty)

const partOne = R.pipe(
  createObject,
  R.until(
    isTreeEmpty,
    R.pipe(
      retrieveNextNode,
      processKnownNodes
    )
  ),
  R.prop('total')
)

console.log('Part 1:', partOne(formatInput(input)))

// -----------------------

const processKnownNodesWithValues = state => {
  let nodes = state.nodes
  const node = nodes.pop()

  if (node.childrenCount === 0) {
    const metadata = state.tree.splice(0, node.metadataCount)
    const parentJob = nodes.pop()

    const value = R.isEmpty(node.values)
      ? R.sum(metadata)
      : R.reduce((sum, nodeReference) => sum + (R.prop(nodeReference - 1, node.values) || 0), 0, metadata)

    if (parentJob) {
      parentJob.values.push(value)
      nodes.push(parentJob)
    } else {
      state.total = value
    }
  } else {
    nodes.push(R.evolve({ childrenCount: R.dec }, node))
    state.shouldAdvance = true
  }
  return state
}

const processNodesWithValues = R.until(
  R.either(
    R.pipe(R.prop('nodes'), R.isEmpty),
    R.pipe(R.prop('shouldAdvance'), R.equals(true)),
  ),
  processKnownNodesWithValues
)

const partTwo = R.pipe(
  createObject,
  R.until(
    isTreeEmpty,
    R.pipe(
      retrieveNextNode,
      processNodesWithValues
    )
  ),
  R.prop('total')
)

console.log('Part 2:', partTwo(formatInput(input)))
