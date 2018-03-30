var {_, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

var download = require('./download.js')
var parse = require('./parse.js')

setInterval(download, 15*1000)
setInterval(parse, 60*1000)

// make it easier to kill
require('http').createServer().listen(3004)