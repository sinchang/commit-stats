'use strict'

const lazy = require('lazy-cache')(require)
const _ = require('lodash')
const repoName = require('git-repo-name')
const moment = require('moment')
const getTpl = require('./template')
lazy('gitty', 'git')


function init(cwd = process.cwd()) {
  const stats = {}
  const Repository = lazy.git.Repository
  const repo = new Repository(cwd)
  const history = repo.logSync()

  stats.repoName = repoName.sync(cwd)

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
    stats[item.type] = [{}]
    range.map(m => {
      stats[item.type][0][m.format(item.format)] = 0
    })
  })

  stats.week = [{
    Sun: 0,
    Mon: 0,
    Tues: 0,
    Wed: 0,
    Thurs: 0,
    Fri: 0,
    Sat: 0
  }]

  stats.author = [{}]

  sortByWeek()
  sortBy('day')
  sortBy('month')
  sortBy('year')
  sortByAuthor()

  console.log(stats)
  let script = ''

  Object.keys(stats).forEach((key, index) => {
    if (key === 'repoName') return false
    const data = stats[key]
    script += `var chart${index} = new G2.Chart({
      container: '${key}', // 指定图表容器 ID
      width : 600, // 指定图表宽度
      height : 300 // 指定图表高度
    });
    chart${index}.source(${data});
    chart${index}.interval().position('genre*sold').color('genre');
    chart${index}.render();`
  })

  function sortByWeek() {
    const weeks = ['Sun', 'Mon', 'Tues', 'Wed', 'thurs', 'Fri', 'Sat']

    history.forEach(item => {
      const day = new Date(item.date).getDay()

      stats.week[0][weeks[day]] = stats.week[0][weeks[day]] + 1
    })
  }

  function sortBy(type) {
    history.forEach(item => {
      const date = new Date(item.date)
      let slug

      if (type === 'day') {
        slug = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
      }

      if (type === 'month') {
        slug = date.getFullYear() + '-' + (date.getMonth() + 1)
      }

      if (type === 'year') {
        slug = new Date(item.date).getFullYear()
      }

      const num = stats[type][0][slug]

      stats[type][0][slug] = num ? num + 1 : 1
    })
  }

  function sortByAuthor() {
    history.forEach(item => {
      const author = item.author
      const num = stats.author[0][author]

      stats.author[0][author] = num ? num + 1 : 1
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

module.exports = init
