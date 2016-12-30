var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var multer = require('multer');
var PDFParser = require("pdf2json");

var upload = multer({
  dest: __dirname + '/public/uploads/',
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== '.pdf') {
      return cb(null, false)
    }

    cb(null, true)
  }
});

var app = express();

var Quote = require('./models/Quote');
var Article = require('./models/Article');
var Search = require('./models/Search');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'pug');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://heroku_3zwvsqsq:446onvqsjjanf81skjhmf51it4@ds149278.mlab.com:49278/heroku_3zwvsqsq');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log('listening on ' + port);
  });
});

/**
 * GET /
 * Get index of searches
 */
app.get('/', (req, res) => {
  Article.collection.count(function(err, articleCount) {
    Search.find(function (err, searches) {
      if (err) return console.error(err);
      res.render('index', {
        searches: searches,
        articleCount: articleCount
      });
    }).sort('-createdAt');
  });
});

/**
 * GET /searches/:id
 * Get index of searches
 */
app.get('/searches/:id', (req, res) => {
  Search.findById(req.params.id, function(err, search) {
    res.render('search', { search: search });
  }).populate('articles');
});

/**
 * POST /searches
 * Adds new search to the database.
 */
app.post('/searches', (req, res) => {
  var data = req.body;
  data.createdAt = Date();

  var newSearch = new Search(data);
  newSearch.save(function (err, quote) {
    if (err) console.log(err);
    console.log('saved to databse');

    res.redirect('/');
  });
});

/**
 * POST /articles
 * Adds new article to the database.
 */
app.post('/articles', upload.array('pdfs', 1000), (req, res) => {
  req.files.forEach(function(file) {
    file.pdfParser = new PDFParser(this,1);

    file.pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    file.pdfParser.on("pdfParser_dataReady", pdfData => {
      file.text = file.pdfParser.getRawTextContent();

      file.createdAt = Date();
      var newArticle = new Article(file);
      newArticle.save(function (err, article) {
        if (err) console.log(err);

        res.redirect('/');
      });
    });

    file.pdfParser.loadPDF(__dirname + "/public/uploads/" + file.filename);
  });
});
