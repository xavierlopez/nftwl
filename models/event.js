const Joi = require('joi');
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  datetime: Date,
  phase: String
});

const Event = mongoose.model('Event', eventSchema);

function validateEvent(event) {
  const schema = {
    description: Joi.string().min(5).max(50).required(),
    date:Joi.date(), 
    phase:Joi.string()
  };

  return Joi.validate(event, schema);
}

exports.eventSchema = eventSchema;
exports.Event = Event; 
exports.validate = validateEvent;