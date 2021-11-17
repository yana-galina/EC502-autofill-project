const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;
const app = express();

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'pages')));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.get('/hidden_attribute', function(req, res) {
	res.sendFile(path.join(__dirname, 'pages', 'hidden_attribute.html'));
});

app.get('/hidden_attribute2', function(req, res) {
	res.sendFile(path.join(__dirname, 'pages', 'hidden_attribute2.html'));
});

app.get('/out_of_sight', function(req, res) {
	res.sendFile(path.join(__dirname, 'pages', 'out_of_sight.html'));
});

app.listen(port, () => {
	console.log(`Server has started on port ${port}`);
});
