var {_, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

var feeds = '1 26 16 21 2 11 31 36 51'.split(' ')
var outDir = __dirname + '/raw-data/';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function download(){
  feeds.forEach(feed => {
    var url = 'http://datamine.mta.info/mta_esi.php?key=a1fce28a47b1b0a9a20a32b27ffd941d&feed_id=' + feed 

    request({url, encoding: null}, (error, response, body) => {
      var feedStr = d3.format('02')(feed) + '_' + d3.isoFormat(new Date())
      console.log(feedStr)

      if (!error && response.statusCode != 200) console.log(error)
      fs.writeFileSync(outDir + feedStr + '.gtfs', body)
    })

  })
}

download()
setInterval(download, 15*1000)
