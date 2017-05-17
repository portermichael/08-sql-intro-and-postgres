'use strict';

// DONE: Install and require the NPM Postgres package 'pg' into your server.js, and ensure that it is then listed as a dependency in your package.json
const fs = require('fs');
const express = require('express');
const pg = require('pg');

// REVIEW: Require in body-parser for post requests in our server. If you want to know more about what this does, read the docs!
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

// DONE: Complete the connection string for the url that will connect to your local postgres database
// Windows and Linux users; You should have retained the user/pw from the pre-work for this course.
// Your url may require that it's composed of additional information including user and password

// const conString = 'postgres://localhost:5432';
const conString = 'postgres://postgres:freeze1019@localhost:5432/kilovolt';

// DONE: Our pg module has a Client constructor that accepts one argument: the conString we just defined.
//       This is how it knows the URL and, for Windows and Linux users, our username and password for our
//       database when client.connect is called on line 26. Thus, we need to pass our conString into our
//       pg.Client() call.
const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app is aware and can use the body-parser module
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', function(request, response) {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Identify which line(s) of code from the client-side blog app are interacting with this particular piece of `server.js`, and the name of the method. Do those lines of code interact with or invoke a different portion of the blog, and if so, where? What part of CRUD is being enacted/managed by this particular piece of code?

  // 1) Numbers 5. This function is getting the new.html page.
  // 2) We're sending the new.html page, so any functions on that page are getting activated. We see articleView.initNewArticlePage is getting called, and that is in articleView.js line 76.
  // 3) articleView.initNewArticlePage shows the tab-content class and we have two event listeners on the new-form id. The event listeners invoke additional functions, articleView.create and articleView.submit, to populate the preview and submit the content to the database.
  // 4) We're reading the new.html file, and on this html file we can create a new blog post, although that isn't directly in this function.


  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', function(request, response) {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Identify which line(s) of code from the client-side blog app are interacting with this particular piece of `server.js`, and the name of the method. Do those lines of code interact with or invoke a different portion of the blog, and if so, where? What part of CRUD is being enacted/managed by this particular piece of code?
  // 1) In the diagram it is 3 and 4. We are querying the database and sending the results back.
  // 2) This code is invoked in our index.html page. We're creating the query for the function Article.fetchAll in article.js line 45. So when .fetchAll is called, the data it's getting in $.get('/articles') is this query.
  // 3) This .fetchAll invokes loadAll which sorts and constructs the article array. fetchAll also has a callback which invokes the passed argument object articleView.initIndexPage.
  // 4) This is just the Read in CRUD.
  client.query('SELECT * FROM articles')
  .then(function(result) {
    response.send(result.rows);
  })
  .catch(function(err) {
    console.error(err)
  })
});

app.post('/articles', function(request, response) {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Identify which line(s) of code from the client-side blog app are interacting with this particular piece of `server.js`, and the name of the method. Do those lines of code interact with or invoke a different portion of the blog, and if so, where? What part of CRUD is being enacted/managed by this particular piece of code?
  // 1) Number 3. We are POSTing results to the database using client.query and expecting an 'insert complete' response or an error.
  // 2) This code interacts with insertRecord on line 69 of article.js. It receives it's data from insertRecord which it POSTs to the database.
  // 3) insertRecord does not invoke any additional code.
  // 4) We are enacting the CREATE portion on the new.html page.
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
  .then(function() {
    response.send('insert complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.put('/articles/:id', function(request, response) {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Identify which line(s) of code from the client-side blog app are interacting with this particular piece of `server.js`, and the name of the method. Do those lines of code interact with or invoke a different portion of the blog, and if so, where? What part of CRUD is being enacted/managed by this particular piece of code?
  // 1) Number 3. We are PUTing data to the database using client.query to update a row and expecting an 'update complete' response or an error.
  // 2) Yes Article.prototype.updateRecord interacts with this piece of code. This code receives the data from with a PUT request from the updateRecord in line 88 of article.js.
  // 3) No updateRecord does not interact with any other code.
  // 4) Update.
  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
  .then(function() {
    response.send('update complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.delete('/articles/:id', function(request, response) {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Identify which line(s) of code from the client-side blog app are interacting with this particular piece of `server.js`, and the name of the method. Do those lines of code interact with or invoke a different portion of the blog, and if so, where? What part of CRUD is being enacted/managed by this particular piece of code?
  // 1) Number 3, we are DELETEing a record/row in the database.
  // 2) It interacts with Article.prototype.deleteRecord line line 77 of article.js where it receives which id to identify the article to delete.
  // 3) No it doesn't interact with any other code.
  // 4) DELETE
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
  .then(function() {
    response.send('Delete complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.delete('/articles', function(request, response) {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Identify which line(s) of code from the client-side blog app are interacting with this particular piece of `server.js`, and the name of the method. Do those lines of code interact with or invoke a different portion of the blog, and if so, where? What part of CRUD is being enacted/managed by this particular piece of code?
  // 1) Number 3, we are DELETEing many records/rows in the database.
  // 2) Yes it interacts with .truncateTable in article.js on line 58, which deletes a currently undetermined chunk of articles. To be determined?
  // 3) This does not call any other functions.
  // 4) DELETE
  client.query(
    'DELETE FROM articles;'
  )
  .then(function() {
    response.send('Delete complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

// COMMENT: What is this function invocation doing?
// It's creating our articles table.
loadDB();

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Identify which line(s) of code from the client-side blog app are interacting with this particular piece of `server.js`, and the name of the method. Do those lines of code interact with or invoke a different portion of the blog, and if so, where? What part of CRUD is being enacted/managed by this particular piece of code?
  // 1) Numbers 3 and 4. If the data is in the database it grabs them and is 4, if it's not, it gets it from our .json file and creates it in the database.
  // 2) This code doesn't interact with client-side data, it interacts in loadDB, which is when our database is turned on.
  // 3) No other interaction.
  // 4) This code does a READ and CREATE.
  client.query('SELECT COUNT(*) FROM articles')
  .then(result => {
    // REVIEW: result.rows is an array of objects that Postgres returns as a response to a query.
    //         If there is nothing on the table, then result.rows[0] will be undefined, which will
    //         make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    //         Therefore, if there is nothing on the table, line 151 will evaluate to true and
    //         enter into the code block.
    if(!parseInt(result.rows[0].count)) {
      fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
          client.query(`
            INSERT INTO
            articles(title, author, "authorUrl", category, "publishedOn", body)
            VALUES ($1, $2, $3, $4, $5, $6);
          `,
            [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
          )
        })
      })
    }
  })
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Identify which line(s) of code from the client-side blog app are interacting with this particular piece of `server.js`, and the name of the method. Do those lines of code interact with or invoke a different portion of the blog, and if so, where? What part of CRUD is being enacted/managed by this particular piece of code?
  // 1) Number 3. We are creating a table.
  // 2) This code doesn't interact with any client side function. It calles load articles after creating a table and is invoked on server start.
  // 3) no other code.
  // 4) CREATE, but not a row, a table.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
    )
    .then(function() {
      loadArticles();
    })
    .catch(function(err) {
      console.error(err);
    }
  );
}
