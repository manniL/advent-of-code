const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

Lazy.ArrayLikeSequence.define('rotate', {
  init (offset, reverse = false) {
    this.offset = offset
    this.reverse = reverse
  },

  get (i) {
    let index = (i + (this.reverse ? -this.offset : this.offset)) % this.parent.length()
    if (index < 0) {
      index += this.parent.length()
    }
    return this.parent.get(index)
  }
})

const solveFirstTask = (seq) => {
  return seq.map(p => p.name).without(seq.map((p) => p.programs).filter().flatten().uniq()).first()
}

const solveSecondTask = (seq, name) => {

  const nodeWeight = (seq, name) => {

    let node = seq.findWhere({name})

    if (node.programs !== false) {
      return node.programs.reduce((c, p) => c + nodeWeight(seq, p), 0) + node.weight
    }
    return node.weight
  }

  const childWeight = (seq, name) => {
    let node = seq.findWhere({name})

    return node.programs === false ? 0 : node.programs.reduce((c, p) => c + nodeWeight(seq, p), 0)
  }
  console.log('init mapping')

  let newSeq = seq.map((p) => ({
    ...p,
    childWeight: childWeight(seq, p.name),
    absWeight: childWeight(seq, p.name) + p.weight
  }))

  let lastNode = null
  let currentNode = newSeq.findWhere({name})

  console.log('Let\'s get ready to rumble!')
  while (true) {
    console.log('Start now with', lastNode, currentNode)

    if (!currentNode.programs) {
      break
    }
    let programs = currentNode.programs.map((name) => newSeq.findWhere({name}))
    let uniqueWeights = programs.map((node) => node.childWeight + node.weight).filter((weight, i, self) => {
      return self.lastIndexOf(weight) === self.indexOf(weight)
    })

    if (!uniqueWeights.length) {
      break
    }

    lastNode = currentNode
    currentNode = Lazy(programs).findWhere({absWeight: uniqueWeights[0]})
  }
  let evenWeight = lastNode.programs.map((name) => newSeq.findWhere({name}).absWeight).filter((a, i, self) => {
    return self.lastIndexOf(a) !== i
  })

  return evenWeight - currentNode.childWeight
}

const solveTasks = (seq) => {

  let overview = Lazy(seq).split('\n').map((line) => {
    line = line.split(' ')
    let name = line[0]
    let weight = parseInt(line[1].replace(/[()]/g, ''))
    let programs = false
    if (line.length > 2) {
      programs = [...line].splice(3).map((p) => p.replace(/[,]/g, ''))
    }
    return {
      name,
      weight,
      programs
    }
  })
  let top = solveFirstTask(overview)

  console.log(top, solveSecondTask(overview, top))

}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)
