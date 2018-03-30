var {_, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')


var outDir = __dirname + '/raw-data/';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);


var feeds = '1 26 16 21 2 11 31 36 51'.split(' ')

feeds.forEach(feed => {
  var url = 'http://datamine.mta.info/mta_esi.php?key=a1fce28a47b1b0a9a20a32b27ffd941d&feed_id=' + feed 

  request({url, encoding: null}, (error, response, body) => {
    var dateStr = d3.isoFormat(new Date())
    console.log(dateStr);

    if (!error && response.statusCode != 200) console.log(error)
    fs.writeFileSync(outDir + feed + '_' + dateStr + '.gtfs', body);
  })

})


