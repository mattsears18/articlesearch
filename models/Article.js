'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PDFParser = require("pdf2json");
var path = require('path');
var extract = require('pdf-text-extract');

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

var pdfParser = new PDFParser();

articleSchema.post('save', function(article) {
  if(!article.processed) {
    var filePath = path.join(__dirname + "/../public/uploads/" + article.filename);

    extract(filePath, { splitPages: false }, function (err, text) {
      if (err) {
        console.dir(err)
        return
      }

      article.text = text;
      article.processed = true;

      article.save(function (err, article) {
        if (err) {
          console.log(err);
          res.send(err);
        }

        console.log('Text parsed: ' + article.originalname);
      });
    });
  }
});

module.exports = mongoose.model('Article', articleSchema);
