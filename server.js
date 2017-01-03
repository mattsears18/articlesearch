'use strict'
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var pdftotext = require('pdftotextjs');

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

//var mongodbUri = process.env.MONGODB_URI || 'localhost/test';
var mongodbUri = process.env.MONGODB_URI || 'mongodb://heroku_3zwvsqsq:446onvqsjjanf81skjhmf51it4@ds149278.mlab.com:49278/heroku_3zwvsqsq';

mongoose.connect(mongodbUri, options);
app.db = mongoose.connection;
mongoose.Promise = require('bluebird');

app.db.on('error', console.error.bind(console, 'connection error:'));
app.db.once('open', function() {
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
* GET /
* Get index of searches
*/
app.get('/articles', (req, res) => {
  Article.find(function (err, articles) {
    if (err) return console.error(err);
    res.render('articles', {
      articles: articles
    });
  }).sort('normalizedName').select('originalname filename');
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
  console.log(processArticles());
});

function processArticles(err, articles) {
  Article.find({ processed: { $exists: false } }, (err, articles) => {
    articles.forEach((article) => {
      if(!article.processed) {
        var filePath = path.join(__dirname + "/public/uploads/" + article.filename);
        var pdf = new pdftotext(filePath);

        pdf.getText(function(err, text, cmd) {
          if (err) {
            console.error(err);
          } else {
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
      }
    });

    Article.find({ processed: { $exists: false } }, (err, articles) => {
      if(articles.length > 1) {
        processArticles();
      }
    }).select('filename');
  }).select('originalname filename');
}
