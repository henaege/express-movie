var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: config.sql.host,
  user: config.sql.user,
  password: config.sql.password,
  database: config.sql.database
});

connection.connect();

const apiBaseUrl = 'http://api.themoviedb.org/3';
  const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+ config.apiKey;
  const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
/* GET home page. */
router.get('/', function(req, res, next) {
  
  request.get(nowPlayingUrl, (error, response, movieData)=> {
    var movieData = JSON.parse(movieData);
    console.log(req.session);
    res.render('movie_list', { 
      movieData: movieData.results,
      imageBaseUrl: imageBaseUrl,
      titleHeader: 'Welcome to Thunderdome'
     });
  })
  
});

router.post('/search', (req, res)=> {
  // req.body is available because of the body-parser module, which was installed when the express app was created. It is where POSTED data will live
  var termUserSearchedFor = req.body.searchString;
  var searchUrl = apiBaseUrl + '/search/movie?query='+ termUserSearchedFor + '&api_key=' + config.apiKey;
  request.get(searchUrl, (error, response, movieData)=> {
    // res.json(JSON.parse(movieData));
    req.body.searchString = "";
    var movieData = (JSON.parse(movieData));
    res.render('movie_list', {
      movieData: movieData.results,
      imageBaseUrl: imageBaseUrl,
      titleHeader: "I ain't got time to bleed"
    });
  });
});

router.get('/movie/:id', (req, res)=> {
  // the route has a ':' in ITextWriter. This means it is a wild Card. 
  var thisMovieId = req.params.id;
  // build the URL per the api docs
  var thisMovieUrl = `${apiBaseUrl}/movie/${thisMovieId}?api_key=${config.apiKey}`;
  var thisCastUrl = `${apiBaseUrl}/movie/${thisMovieId}/credits?api_key=${config.apiKey}`;
  console.log(thisCastUrl)
  var thisTrailerUrl = `${apiBaseUrl}/movie/${thisMovieId}/videos?language=en-US&api_key=${config.apiKey}`;

  // use the request module to make an HTTP get request
  request.get(thisMovieUrl, (error, response, movieData)=> {
    request.get(thisCastUrl, (error, response, castData)=> {
      request.get(thisTrailerUrl, (error, response, videoData)=> {

    var newData = (JSON.parse(movieData));
    console.log(newData.budget)
    var newCastData = (JSON.parse(castData));
    console.log(newCastData);
    var trailerData = (JSON.parse(videoData));
    console.log(trailerData);
    
    for (let i=0; i < trailerData.results.length; i++){
        if (trailerData.results[i].name == "Official Trailer"){
            var youTubeId = trailerData.results[i].key;
        } else if (trailerData.results[i].name == "Official Teaser"){
            var youTubeId = trailerData.results[i].key;
        }else {
            var youTubeId = trailerData.results[0].key;
        }
    }
    console.log(youTubeId)
    var trailerLink = `https://www.youtube.com/watch?v=${youTubeId}`
    console.log(trailerLink);
    // parse the response into JSON
    // var movieData = JSON.parse(movieData);
    // var castData = JSON.parse(castData);
    // First arg: view File
    // second arg: object to send the view file
    // res.json(movieData);
    res.render('single-movie', {
      movieData: newData,
      imageBaseUrl: imageBaseUrl,
      castData: newCastData,
      trailer: trailerLink
    });
  });
  });
  });
  
});

router.get('/register', (req, res)=> {
  var message = req.query.msg;
  if(message == "badEmail") {
    message = "This email is already registered";
  }
  res.render('register', {message: message});
});

router.post('/registerProcess', (req, res)=> {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var selectQuery = "SELECT * FROM users WHERE email = ?;";
  connection.query(selectQuery, [email], (error, results)=> {
    if (results.length == 0) {
      var insertQuery = "INSERT INTO users (name,email,password) VALUES (?,?,?);";
      connection.query(insertQuery, [name,email,password], (error, results)=> {
      req.session.name = name;
      req.session.email = email;
      req.session.loggedin = true;
      res.redirect('/?msg=registered');
      });
    } else {
      res.redirect('/register/?msg=badEmail');
    }
  })

  
 
});

router.get('/login', (req, res)=> {
  
  res.render('login', {});
});



module.exports = router;
