Article Search
======================

This package is a Heroku app for searching many PDF files (thousands) at a time.
It allows a user to upload PDF files, which are stored locally and then
converted to plain text using `pdftotext`. The plain text is stored in a mongoDB
database, which is then searchable.

Installation
------------

    git clone git@github.com:mattsears18/articlesearch.git
    cd articlesearch
    heroku create
    git push heroku master
    heroku open
