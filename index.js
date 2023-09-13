require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { throws } = require('assert');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


let link = {}
let counter = 0

app.post("/api/shorturl", (req,res) => {
  const url = req.body.url

	try {
		const urlChecker = new URL(url)

		if(urlChecker.protocol == "https:" || urlChecker.protocol == "http:") {
		link[counter] = url
		++counter

		res.json({
			original_url: url,
			short_url: counter-1
		})
}
		else{
			throw new Error("invalid url")
		}
		

	} catch (err) {
		res.json({ error: 'invalid url' })
	}

})

app.get("/api/shorturl/:short_url", (req,res) => {
	const sURL = req.params.short_url
	const url = link[sURL]
	res.redirect(url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
