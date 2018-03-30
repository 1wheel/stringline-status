var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var {_, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

var parsedFiles = {}
var slug2hash = {}

module.exports = function(){
  console.log('parse start', new Date())
  var files = glob.sync(__dirname + '/raw-data/*.gtfs')
    .filter(d => !parsedFiles[d])

  jp.nestBy(files, d => d.split('raw-data')[1].split('T')[0]).forEach(parseDay)
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
      var route = trip.split('_')[1].substring(0, 1)

      entity.trip_update.stop_time_update.forEach(d => {
        var stop = d.stop_id
        var time = d.arrival || d.departure ? (d.arrival || d.departure).time.low : 0
        tripStop2time[trip + ' ' + stop] = feed.header.timestamp.low + ' ' + time
      })
    })

  })

  var tidy = d3.entries(tripStop2time).map(d => {
    return {
      route: d.key.split(' ')[0].split('_')[1].substring(0, 1),
      trip: d.key.split(' ')[0],
      stop: d.key.split(' ')[1],
      timestamp: d.value.split(' ')[0],
      arrival: d.value.split(' ')[1],
      isValid: true
    }
  })

  jp.nestBy(tidy, d => d.trip).forEach(trip => {
    jp.nestBy(trip, d => d.timestamp).forEach(timestamps => {
      if (timestamps.length < 2) return
      timestamps.forEach(d => (d.isValid = false))
    })
  })

  // tidy = tidy.filter(d => d.isValid)
  // tidy.forEach(d => delete d.isValid)

  console.log(files.key)

  // io.writeDataSync(__dirname + '/../parsed-data/' + date + '.json', tripStop2time)
  io.writeDataSync(__dirname + '/../chart/parsed-data/' + files.key + '.tsv', tidy)
}
