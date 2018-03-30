var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var {_, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')


glob.sync(__dirname + '/raw-data/*.gtfs').forEach(file => {
  console.log(file)

  var feed = GtfsRealtimeBindings.FeedMessage.decode(fs.readFileSync(file))
  feed.entity.forEach(d => {
    if (!d.trip_update) return
  })

  var lines = _.uniq(feed.entity.filter(d => d.trip_update).map(d => d.trip_update.trip.route_id))

  console.log(lines)

})
GtfsRealtimeBindings