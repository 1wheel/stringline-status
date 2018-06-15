var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var {_, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

var parsedFiles = {}
var slug2hash = {}

var outDir = __dirname + '/../chart/parsed-data/'

module.exports = function(){
  console.log('parse start', new Date())

  var curDate = d3.isoFormat(new Date()).slice(0, 10)
  console.log('curDate', curDate)

  var files = glob.sync(__dirname + `/raw-data/*${curDate}*.gtfs`)
    // .filter(d => d.includes(curDate))
    .filter(d => !parsedFiles[d])

  console.log('num files', files.length)

  var allTidy = jp.nestBy(files, d => d.split('raw-data')[1].split('T')[0])
    .map(parseDay)

  var curTime = (new Date())/1000
  var recent = _.flatten(allTidy)
    .filter(d => d.isValid)
    .filter(d => curTime - d.timestamp < 60*60)

  recent.forEach(d => {
    delete d.isValid
    delete d.timestamp
  })

  io.writeDataSync(outDir + 'recent.tsv', recent)
}
module.exports()

function parseDay(files){
  var tripStop2time = slug2hash[files.key] || {}
  slug2hash[files.key] = tripStop2time

  files.forEach(file => {
    parsedFiles[file] = true

    try{
      var feed = GtfsRealtimeBindings.FeedMessage.decode(fs.readFileSync(file))
    } catch (e){ return }

    feed.entity.forEach(entity => {
      if (!entity.trip_update) return

      var trip = entity.trip_update.trip.trip_id

      entity.trip_update.stop_time_update.forEach(d => {
        var stop = d.stop_id
        var time = d.arrival || d.departure ? (d.arrival || d.departure).time.low : 0
        tripStop2time[trip + ' ' + stop] = feed.header.timestamp.low + ' ' + time
      })
    })

  })

  var tidy = d3.entries(tripStop2time).map(d => {
    return {
      route: d.key.split(' ')[0].split('_')[1].substring(0, 2),
      trip: d.key.split(' ')[0],
      stop: d.key.split(' ')[1],
      timestamp: d.value.split(' ')[0],
      arrival: d.value.split(' ')[1],
      isValid: true
    }
  })

  jp.nestBy(tidy, d => d.trip).forEach(trip => {
    jp.nestBy(trip, d => d.timestamp).forEach(timestamps => {
      if (timestamps.length < 3) return
      timestamps.forEach(d => (d.isValid = false))
    })
  })

  console.log(files.key, files.length)

  // io.writeDataSync(__dirname + '/../parsed-data/' + date + '.json', tripStop2time)
  io.writeDataSync(outDir + files.key + '.tsv', tidy)

  return tidy
}
