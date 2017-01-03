'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PDFParser = require("pdf2json");

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
    pdfParser.on("pdfParser_dataError", errData => {
      console.log('pdfParser Error');
      console.error(errData);
    });

    pdfParser.on("pdfParser_dataReady", pdfData => {
      article.text = pdfParser.getRawTextContent();
      article.processed = true;

      article.save(function (err, article) {
        //if (err) res.send(err)
          //console.log(err);

        console.log('Text parsed: ' + article.originalname);
      });
    });

    pdfParser.loadPDF(__dirname + "/../public/uploads/" + article.filename);
  }
});

module.exports = mongoose.model('Article', articleSchema);
