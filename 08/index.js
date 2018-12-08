const R = require('ramda')
const { readFile } = require('../utils/fs.js')
const path = require('path')

const input = readFile(path.join(__dirname, './input.txt'))

const formatInput = R.pipe(R.split(' '), R.map(Number))

const createObject = R.applySpec({
  tree: R.identity,
  nodes: R.always([]),
  total: R.always(0)
})

const retrieveNextNode = state => {
  const { nodes, tree, ...leftoverState } = state

  const [childrenCount, metadataCount, ...leftoverTree] = tree
  nodes.push({ childrenCount, metadataCount, values: [] })
  return { ...leftoverState, nodes, tree: leftoverTree, shouldAdvance: false }
}

const processNodes = state => {
  let { nodes, tree, total, shouldAdvance } = state
  let node = nodes.pop()

  if (node.childrenCount === 0) {
    const metadata = tree.splice(0, node.metadataCount)
    total += R.sum(metadata)
  } else {
    nodes.push(R.evolve({ childrenCount: R.dec }, node))
    shouldAdvance = true
  }
  return { nodes, tree, total, shouldAdvance }
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
