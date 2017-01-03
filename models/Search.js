'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Search', new mongoose.Schema({
  term: String,
  resultCount: { type: Number, default: 0 },
  articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  createdAt: Date
}));
