/* global $ */
$(document).ready(function () {
  var radius = 200
  var nrOffset = 20
  var spinning = null
  var spinAmount = 10
  var currAngle = 0
  var finalAngle = 0
  var selected = null
  var boxes = []
  var puzzle = null

  function init () {
    getCookie()

    for (var p = 0; p < puzzles.length; p++) {
      $('.selpuzzle select').append('<option value="' + p + '">' + puzzles[p].week + (puzzles[p].solved ? ' (Löst)' : '') + '</option>')
    }
    puzzleSelected(0)

    $(document).on('keydown', function (e) {
      if (e.which === 8) e.preventDefault()
    })
    $(document).on('keyup', charEnter)
    $(window).on('resize', drawBoxes)

    $('.cheat a').on('click', cheat)
    $('.forget a').on('click', forget)

    $('.selpuzzle select').on('change', selectPuzzle)

    drawBoxes()
  }

  function getCookie () {
    var cookies = document.cookie.split(';')
    var solved = []
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].split('=')
      if (cookie[0].trim() === 'solved') {
        solved = cookie[1].split(',')
      }
    }
    for (var j = 0; j < solved.length; j++) {
      var apuzzle = puzzles.find(function (p) { return p.number === parseInt(solved[j]) })
      if (apuzzle) {
        apuzzle.solved = true
      }
    }
  }

  function saveCookie () {
    var solved = ''
    for (var j = 0; j < puzzles.length; j++) {
      if (puzzles[j].solved) {
        if (solved.length > 0) solved += ','
        solved += puzzles[j].number
      }
    }
    document.cookie = 'solved = ' + solved + ';'
  }

  function selectPuzzle () {
    $('.success').slideUp()
    puzzleSelected(this.value)
    currAngle = 0
    drawBoxes()
  }

  function puzzleSelected (nr) {
    puzzle = puzzles[nr]

    puzzle.numbers = []
    for (var p = 0; p < puzzle.numberString.length; p++) {
      if (puzzle.numberString[p] !== ' ') puzzle.numbers.push(p + 1)
    }
    puzzle.solution = puzzle.solutionString.split('')
    puzzle.nofBoxes = puzzle.solution.length

    $('.puzzle').empty()
    boxes = []
    for (var i = 0; i < puzzle.nofBoxes; i++) {
      var abox = $('<div class="wordbox" data-nr="' + i + '"><div class="number"></div><div class="letter"><input type="text" /></div></div>')
      abox.nr = i
      abox.on('click', boxClicked)

      if (puzzle.solved) {
        abox.letter = puzzle.solutionString[i]
      }

      boxes.push(abox)
      $('.puzzle').append(abox)
    }
    selected = boxes[0]

    for (var j = 0; j < puzzle.numbers.length; j++) {
      var num = puzzle.numbers[j]
      boxes[num - 1].number = j + 1
    }

    $('.leads ol').empty()
    for (var k = 0; k < puzzle.leads.length; k++) {
      $('.leads ol').append('<li>' + puzzle.leads[k] + '.</li>')
    }
    checkSolution()
  }

  function boxClicked () {
    var clickbox = $(this)
    var selbox = boxes.find(function (b) {
      return b.nr === clickbox.data('nr')
    })
    selectBox(selbox)
  }

  function cheat () {
    var nr = -1
    var count = 0
    while (nr === -1 && count < 1000) {
      var testnr = Math.floor(Math.random() * puzzle.nofBoxes)
      if (!boxes[testnr].letter || boxes[testnr].letter === '') {
        nr = testnr
      }
      count++
    }
    if (nr !== -1) {
      boxes[nr].letter = puzzle.solutionString[nr]
      drawBoxes()
      checkSolution()
    }
  }

  function forget () {
    puzzle.solved = false
    saveCookie()
    $('.success').slideUp()
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].letter = ''
    }
    var sel = $('.selpuzzle select option:selected')
    sel.text(sel.text().substring(0, sel.text().length - 7))
    drawBoxes()
  }

  function sizeBoxes (width, circleRadius, innerRadius) {
    var fontSize = circleRadius / 7
    var textOffset = nrOffset + width + innerRadius / 10
    $('.wordbox').css({ width: width, height: width + nrOffset })
    $('.wordbox .number').css({ height: nrOffset })
    $('.wordbox .letter').css({ height: width, width: width })
    $('.wordbox .letter input').css({ height: width, width: width, lineHeight: width + 'px', fontSize: width + 'px' })
    $('.title').css({ width: 2 * circleRadius, fontSize: fontSize })
    $('.title1').css({ top: textOffset })
    $('.title2').css({ top: 2 * circleRadius - textOffset - fontSize })
    var textRadius = circleRadius - textOffset - fontSize
    $('.title1').arctext({ radius: textRadius })
    $('.title2').arctext({ radius: textRadius, dir: -1 })
  }

  function getRadius () {
    var puzzleWidth = $('.puzzle').width()
    return (puzzle.nofBoxes + Math.PI) * (puzzleWidth - nrOffset) / (2 * puzzle.nofBoxes + 4 * Math.PI)
  }

  function drawBoxes () {
    radius = getRadius()
    var width = 2 * Math.PI * radius / (puzzle.nofBoxes + Math.PI)
    var circleRadius = radius + (nrOffset + width) / 2
    var innerRadius = radius - (nrOffset + width) / 2
    $('.puzzle').height(2 * circleRadius)
    sizeBoxes(width, circleRadius, innerRadius)
    for (var i = 0; i < boxes.length; i++) {
      var angle = i * 2 * Math.PI / puzzle.nofBoxes + toRad(currAngle)
      var x = radius * Math.sin(angle) + circleRadius - width / 2
      var y = radius * (1 - Math.cos(angle))
      var deg = toDeg(angle)
      boxes[i].find('.letter input').val(boxes[i].letter)
      if (boxes[i].number) {
        boxes[i].find('.number').text(boxes[i].number)
      }
      boxes[i].css({ left: x, top: y, transform: 'rotate(' + deg + 'deg)' })
      boxes[i].removeClass('selected')
      if (boxes[i] === selected) {
        boxes[i].addClass('selected')
      }
    }
  }

  function charEnter (e) {
    if ((e.keyCode >= 65 && e.keyCode <= 90) ||
      e.keyCode === 221 || e.keyCode === 222 || e.keyCode === 192) {
      selected.letter = String.fromCharCode(e.keyCode).toUpperCase()
      var nextNr = (selected.nr + 1) % puzzle.nofBoxes
      selectBox(boxes[nextNr])
      checkSolution()
    } else if (e.keyCode === 8 || e.keyCode === 46) {
      selected.letter = ''
      drawBoxes()
    } else if (e.keyCode === 37) {
      var prevNr = (selected.nr - 1)
      if (prevNr < 0) prevNr = puzzle.nofBoxes - 1
      selectBox(boxes[prevNr])
    } else if (e.keyCode === 39) {
      var nextNr = (selected.nr + 1) % puzzle.nofBoxes
      selectBox(boxes[nextNr])
    }
  }

  function checkSolution () {
    var answer = ''
    for (var i = 0; i < puzzle.nofBoxes; i++) {
      answer = answer + boxes[i].letter
    }
    if (answer === puzzle.solutionString) {
      puzzle.solved = true
      saveCookie()

      var sel = $('.selpuzzle select option:selected')
      if (sel.text().indexOf('(Löst)') < 0) {
        sel.text(sel.text() + ' (Löst)')
      }

      $('.success').slideDown()
    }
  }

  function selectBox (box) {
    selected = box
    drawBoxes()
    spinToBox(selected)
    selected.find('input').focus()
  }

  function spinToBox (box) {
    if (!spinning) {
      finalAngle = 360 - selected.nr * 360 / puzzle.nofBoxes

      var diff = currAngle - finalAngle
      var direction = (diff > 0 ? -1 : 1)

      if (diff < -180) {
        currAngle += 360
        direction = -1
      }
      if (diff > 180) {
        currAngle -= 360
        direction = 1
      }
      diff = currAngle - finalAngle
      spinAmount = Math.trunc(Math.abs(diff) / 10)

      spinning = setInterval(function () {
        spin(direction)
      }, 50)
    }
  }

  function spin (direction) {
    if ((direction === -1 && currAngle <= finalAngle) || (direction === 1 && currAngle >= finalAngle)) {
      clearInterval(spinning)
      spinning = null
    } else {
      currAngle += direction * spinAmount
      drawBoxes()
    }
  }

  function toDeg (angle) {
    return angle * 360 / 2 / Math.PI
  }

  function toRad (angle) {
    return angle * 2 * Math.PI / 360
  }

  init()
})
