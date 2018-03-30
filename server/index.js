var {_, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

var download = require('./download.js')
setInterval(download, 15*1000)



// require('./download.js')