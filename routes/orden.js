const path = require('path')
const fs = require('fs')
const util = require('util')

const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

exports.index = async (req, res, next) => {
  const puzzles = await readPuzzles()
  res.render('orden', { puzzles })
}

const getDate = (nr) => {
  const week = (40 + nr) % 52 + 1
  const year = Math.trunc((40 + nr) / 52) + 1984
  return { week, year }
}

const readPuzzles = async () => {
  const directoryPath = path.join(appRoot, 'puzzles')
  const files = await readdir(directoryPath)
  const puzzles = []
  files.sort((f1, f2) => {
    const n1 = parseInt(f1.split('.')[0])
    const n2 = parseInt(f2.split('.')[0])
    return n1 > n2
  })
  for (const file of files) {
    const apath = path.join(appRoot, 'puzzles', file)
    const nr = parseInt(path.basename(apath).split('.')[0])
    const { week, year } = getDate(nr)
    const puzzleTxt = await readFile(apath, 'utf8')
    const lines = puzzleTxt.split('\n')
    puzzles.push({
      number: nr,
      week: `Vecka ${week}, ${year}`,
      numberString: lines[0].trim(),
      solutionString: lines[1].trim(),
      leads: [
        lines[2].trim(),
        lines[3].trim(),
        lines[4].trim(),
        lines[5].trim(),
        lines[6].trim(),
        lines[7].trim(),
        lines[8].trim(),
        lines[9].trim()
      ]
    })
    puzzles.sort((p1, p2) => p1.number - p2.number)
  }
  return puzzles
}
