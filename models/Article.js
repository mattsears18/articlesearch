var mongoose = require('mongoose');

module.exports = mongoose.model('Article', new mongoose.Schema({
  originalname: String,
  filename: String,
  mimetype: String,
  text: String,
  pageCount: Number,
  createdAt: Date
}));
