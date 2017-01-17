'use strict'
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var pdftotext = require('pdftotextjs');
var fs = require('fs');

var multer = require('multer');

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

var options = { server: { socketOptions: { keepAlive: 3700000, connectTimeoutMS: 3600000 } },
                replset: { socketOptions: { keepAlive: 3700000, connectTimeoutMS : 3600000 } } };

var mongodbUri = process.env.MONGODB_URI;

console.log(process.env.MONGODB_URI);

mongoose.connect(mongodbUri, options);
var db = mongoose.connection;
mongoose.Promise = require('bluebird');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  var port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log('listening on ' + port);
  });
});

/**
 * GET /
 * Get index of searches
 */
app.get('/', (req, res) => {
  Article.collection.count((err, articleCount) => {

    Article.find({processed: true}, (err, textArticles) => {
      var processedCount = textArticles.length;

      Search.find(function (err, searches) {
        if (err) return console.error(err);
        res.render('index', {
          searches: searches,
          articleCount: articleCount,
          processedCount: processedCount
        });
      }).sort('-createdAt');
    }).select('originalname');
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
 * GET /searches/delete/:id
 * Get index of searches
 */
app.get('/searches/delete/:id', (req, res) => {
  Search.findByIdAndRemove(req.params.id, function(err, search) {
    res.redirect('/');
  });
});

/**
 * POST /searches
 * Adds new search to the database.
 */
app.post('/searches', (req, res) => {
  var data = req.body;
  data.createdAt = Date();

  var newSearch = new Search(data);

  Article.find({text: new RegExp("\\b" + newSearch.term + "\\b", 'i')}, (err, articles) => {
    console.log(articles);

    newSearch.articles = articles;

    newSearch.save(function (err, quote) {
      if (err) console.log(err);
      console.log('search saved to databse');

      res.redirect('/');
    });

  }).select('text').sort('normalizedName');
});

/**
* GET /
* Get index of searches
*/
app.get('/articles', (req, res) => {
  Article.find(function (err, articles) {
    if (err) return console.error(err);
    res.render('articles', {
      articles: articles
    });
  }).sort('normalizedName').select('originalname filename processed');
});

/**
 * GET /articles/:id
 * Get an article
 */
app.get('/articles/:id', (req, res) => {
  Article.findById(req.params.id, function(err, article) {
    res.render('articles/article', { article: article });
  });
});

/**
 * GET /articles/delete/:id
 * Delete and article
 */
app.get('/articles/delete/:id', (req, res) => {
  Article.findByIdAndRemove(req.params.id, function(err, article) {
    res.redirect('/articles');
  });
});

/**
 * POST /articles
 * Adds new article to the database.
 */
app.post('/articles', upload.array('pdfs', 15000), (req, res) => {
  var counter = 0;
  req.files.forEach(function(file) {
    file.normalizedName = file.originalname.toLowerCase();
    file.createdAt = Date();
    var newArticle = new Article(file);
    newArticle.save(function (err, article) {
      if (err) res.send(err);

      console.log(article.originalname);
      counter++;
      console.log(counter + ' : ' + req.files.length);

      if(counter === req.files.length) {
        console.log('FINISHED UPLOADING ALL FILES!');
        res.send('Success');
      }
    });
  });
});

/**
* GET /
* Get index of searches
*/
app.get('/processArticles', (req, res) => {
  processArticles();
});

function processArticles(err, articles) {
  Article.find({ processed: { $exists: false } }, (err, articles) => {

    for (var i=0; i < articles.length; i++) {
      var article = articles[i];
      if(!article.processed) {
        var filePath = path.join(__dirname + "/public/uploads/" + article.filename);

        if (fs.existsSync(filePath)) {
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
        } else {
          console.log('File does not exist');
        }
      }
    }

    Article.find({ processed: { $exists: false } }, (err, articles) => {
      if(articles.length > 1) {
        processArticles();
      }
    }).select('filename');
  }).select('originalname filename');
}
