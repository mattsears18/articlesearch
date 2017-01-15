'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  originalname: String,
  normalizedName: String,
  filename: String,
  mimetype: String,
  text: String,
  processed: Boolean,
  pageCount: Number,
  createdAt: Date
});

articleSchema.index({ normalizedName: 1 });

module.exports = mongoose.model('Article', articleSchema);
