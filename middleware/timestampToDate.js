module.exports = function(req, res, next) {
  //date in events will be received as string but we convert it here to Date in order to save it in MongoDB
  const events = req.body.events;
  events.forEach(e => {
    e.date = new Date(parseInt(e.date)*1000) //converting timestamp string to Date
  });
  next();
}