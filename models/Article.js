'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  originalname: String,
  normalizedName: String,
  filename: String,
  uri: String,
  publishDate: Date,
  volume: String,
  issue: String,
  mimetype: String,
  text: String,
  processed: Boolean,
  pageCount: Number,
  createdAt: Date
});

articleSchema.index({ normalizedName: 1 });

articleSchema.virtual('filepath').get(function () {
  if(this.uri) {
    return this.uri;
  } else if (this.filename) {
    return "/uploads/" + this.filename;
  }
});

module.exports = mongoose.model('Article', articleSchema);
