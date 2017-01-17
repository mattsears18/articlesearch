Article Search
======================

This package is a Heroku app for searching many PDF files (thousands) at a time.
It allows a user to upload PDF files, which are stored locally and then
converted to plain text using `pdftotext`. The plain text is stored in a mongoDB
database, which is then searchable.

[Heroku-cli](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) required

Installation
------------

    git clone git@github.com:mattsears18/articlesearch.git project-name
    cd project-name
    heroku create
    heroku addons:create mongolab
    heroku buildpacks:add --index 1 heroku/nodejs
    heroku buildpacks:add --index 2 https://github.com/shemer77/heroku-buildpack-xpdf
    git push heroku master
    heroku open

Local Development
-----------------
Do installation as above, then:

    npm install
    heroku config:get MONGODB_URI -s >> .env
    heroku local

You will need `pdftotext` which can be obtained by installing [xPdf](http://www.foolabs.com/xpdf/) locally.

Then navigate to http://localhost:5000

License
-------
License

Article Search is released under the MIT License. See the bundled [LICENSE](https://github.com/mattsears18/articlesearch/blob/master/LICENSE) file for details.
