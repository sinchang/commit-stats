#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const init = require('./index')

const cwd = process.argv[2] || process.cwd()
const tpl = init(cwd)

fs.writeFileSync(path.join(cwd, 'commit-stats.html'), tpl)
