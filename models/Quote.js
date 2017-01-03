'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Quote', new mongoose.Schema({
  name: String,
  quote: String
}));
