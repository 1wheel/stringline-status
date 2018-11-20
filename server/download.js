var {_, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

var feeds = '1 26 16 21 2 11 31 36 51'.split(' ')
var outDir = __dirname + '/raw-days/'

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

function download(){
  feeds.forEach(feed => {
    var url = 'http://datamine.mta.info/mta_esi.php?key=a1fce28a47b1b0a9a20a32b27ffd941d&feed_id=' + feed 

    request({url, encoding: null}, (error, response, body) => {
      var dateStr = (new Date()).toISOString()

      var dayFolder = outDir + dateStr.split('T')[0] + '/'
      if (!fs.existsSync(dayFolder)) fs.mkdirSync(dayFolder)

      var path = dayFolder + feed + '_' + dateStr + '.gtfs'

      if (error) return console.log(path, error)
      if (!response) return console.log(path, 'no response')
      if (response.statusCode != 200) return console.log(path, 'non 200 statusCode:', response.statusCode)

      console.log(path, 'no errors')

      fs.writeFileSync(dayFolder + feed + '_' + dateStr + '.gtfs', body)
    })

  })
}

download()
setInterval(download, 10*1000)
