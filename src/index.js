'use strict'

const lazy = require('lazy-cache')(require)
const repoName = require('git-repo-name')
const moment = require('moment')
const randomColor = require('randomcolor')
const keys = require('lodash.keys')
const values = require('lodash.values')
const getTpl = require('./template')

lazy('gitty', 'git')

function init(cwd = process.cwd()) {
  const stats = {}
  const Repository = lazy.git.Repository
  const repo = new Repository(cwd)
  const history = repo.logSync()

  stats.info = {}
  stats.info.repoName = repoName.sync(cwd)

  const firstDate = moment(new Date(history[0].date))
  const lastDate = moment(new Date(history[history.length - 1].date))

  const types = [{
    type: 'day',
    format: 'YYYY-MM-DD'
  }, {
    type: 'month',
    format: 'YYYY-MM'
  }, {
    type: 'year',
    format: 'YYYY'
  }]

  types.forEach(item => {
    const range = getRangeOfDates(lastDate, firstDate, item.type)
    stats[item.type] = {}
    range.forEach(m => {
      stats[item.type][m.format(item.format)] = 0
    })
  })

  stats.week = {
    Sun: 0,
    Mon: 0,
    Tues: 0,
    Wed: 0,
    Thurs: 0,
    Fri: 0,
    Sat: 0
  }

  stats.author = {}
  sortByWeek()
  sortBy('day')
  sortBy('month')
  sortBy('year')
  sortByAuthor()

  // generate chart script
  let script = ''

  script += `document.getElementById('repoName').innerHTML = '${stats.info.repoName}';`
  script += `document.getElementById('date').innerHTML = '${new Date()}';`

  const backgroundColors = []

  keys(stats.author).forEach(() => {
    backgroundColors.push(randomColor())
  })

  keys(stats).forEach(key => {
    if (key === 'info') return false
    const items = JSON.stringify(keys(stats[key]))
    const counts = JSON.stringify(values(stats[key]))
    if (key === 'author') {
      script += `
      new Chart(document.getElementById('${key}').getContext('2d'), {
        // The type of chart we want to create
        type: 'pie',

        // The data for our dataset
        data: {
          labels: ${items},
          datasets: [{
            backgroundColor: ${JSON.stringify(backgroundColors)},
            data: ${counts},
          }]
        },

        // Configuration options go here
        options: {
          responsive: true,
          legend: {
            display: false
          },
          pieceLabel: {
            // render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
            render: 'label',
          }
        }
      });`
    } else {
      script += `new Chart(document.getElementById('${key}').getContext('2d'), {
        type: 'line',
        data: {
          labels: ${items},
          datasets: [{
            label: "commit count by ${key}",
            backgroundColor: '#36A2EB',
            borderColor: '#36A2EB',
            data: ${counts},
            fill: false,
          }],
        },
        options: {
          responsive: true
        }
      });`
    }
  })

  function sortByWeek() {
    const weeks = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']

    history.forEach(item => {
      const day = new Date(item.date).getDay()

      stats.week[weeks[day]]++
    })
  }

  function sortBy(type) {
    history.forEach(item => {
      const date = new Date(item.date)
      let slug

      if (type === 'day') {
        slug = date.getFullYear() + '-' + addZero((date.getMonth() + 1)) + '-' + addZero(date.getDate())
      }

      if (type === 'month') {
        slug = date.getFullYear() + '-' + addZero((date.getMonth() + 1))
      }

      if (type === 'year') {
        slug = new Date(item.date).getFullYear()
      }

      const num = stats[type][slug]

      stats[type][slug] = num ? num + 1 : 1
    })
  }

  function sortByAuthor() {
    history.forEach(item => {
      const author = item.author
      const num = stats.author[author]

      stats.author[author] = num ? num + 1 : 1
    })
  }

  return getTpl(script)
}

// ref: https://gist.github.com/miguelmota/7905510#gistcomment-2196564
function getRangeOfDates(start, end, key, arr = [start.startOf(key)]) {
  if (start.isAfter(end)) throw new Error('start must precede end')

  const next = moment(start).add(1, key).startOf(key)

  if (next.isAfter(end, key)) return arr

  return getRangeOfDates(next, end, key, arr.concat(next))
}

function addZero(num) {
  return num < 10 ? '0' + num : num
}

module.exports = init
