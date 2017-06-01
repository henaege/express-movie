var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');

const apiBaseUrl = 'http://api.themoviedb.org/3';
  const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+ config.apiKey;
  const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
/* GET home page. */
router.get('/', function(req, res, next) {
  
  request.get(nowPlayingUrl, (error, response, movieData)=> {
    var movieData = JSON.parse(movieData);
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
        } else {
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

module.exports = router;
