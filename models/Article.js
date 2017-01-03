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

/*
articleSchema.post('save', function(article) {
  if(!article.processed) {
    var filePath = path.join(__dirname + "/../public/uploads/" + article.filename);
    var pdf = new pdftotext(filePath);

    var text = pdf.getTextSync();

    article.text = text;
    article.processed = true;

    article.save(function (err, article) {
      if (err) {
        console.log(err);
        res.send(err);
      }

      console.log('Text parsed: ' + article.originalname);
    });
  }
});
*/

module.exports = mongoose.model('Article', articleSchema);
