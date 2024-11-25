require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
let bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// changes
app.use(bodyParser.urlencoded({extended: true}));
let urlDatabase = {};
let shortUrlCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  let parseUrl;
  
  //If you pass an invalid URL
    try {
      parseUrl = new URL(originalUrl);

      if(parseUrl.protocol !== 'http:' && parseUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch(err) {
      return res.json({error: 'invalid url'}); 
    }

    dns.lookup(parseUrl.hostname, (err) => {
      if(err) {
        return res.json({error: 'invalid url'}); 
      }
    });
  
   const shortUrl = shortUrlCounter++;
   urlDatabase[shortUrl] = originalUrl;

   res.json({
     original_url: originalUrl,
     short_url: shortUrl
   });
  
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = parseInt(req.params.shorturl);

  // Check if the short URL exists in the database
  if(urlDatabase[shortUrl]) {
    res.redirect(urlDatabase[shortUrl]);
  } else {
    res.json({error: 'Short URL not found'});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
