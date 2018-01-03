const fs = require('fs')
const cwd = '../../egoist/bili'
const init = require('./index')
const tpl = init(cwd)
// console.log(tpl)
fs.writeFileSync('index.html', tpl)
