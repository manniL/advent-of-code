const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const getPrograms = (seq, currentArray, parent) => {
  currentArray.push(parent)
  let parentNode = seq.findWhere({parent})
  parentNode.programs.forEach((p) => !currentArray.includes(p) ? getPrograms(seq, currentArray, p) : null)

  return currentArray
}

const solveFirstTask = (lines) => {

  let resultPrograms = getPrograms(Lazy(lines), [], '0')
  return resultPrograms.reduce((c) => ++c, 0)
}

const solveSecondTask = (lines) => {
  let groups = 0
  while (lines.length) {
    let resultPrograms = getPrograms(Lazy(lines), [], lines[0].parent)
    lines = lines.filter((node) => !resultPrograms.includes(node.parent))
    groups++
  }
  return groups
}

const solveTasks = (inputString) => {
  let lines = inputString.replace(/,/g, '').split('\n').map((line) => {
    let [parent, , ...programs] = [...(line.split(' '))]
    return {parent, programs}
  })
  console.log(solveFirstTask([...lines]), solveSecondTask([...lines]))

}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)