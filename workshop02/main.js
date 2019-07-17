const range = require('express-range')
const compression = require('compression')

const express = require('express')

const CitiesDB = require('./citiesdb');

//Load application keys
//Rename _keys.json file to keys.json
const keys = require('./keys.json')

console.info(`Using ${keys.mongo}`);

const db = CitiesDB({  
	connectionUrl: keys.mongo, 
	databaseName: 'cities', 
	collectionName: 'cities'
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start of workshop

// Mandatory workshop
// TODO GET /api/states
app.get('/api/states', function(req, res) {
	res.contentType('application/json')
	db.findAllStates()
		.then(function(result) {
			res.status(200)
			res.json(result);
		})
		.catch(err => {
			res.status(400)
			res.json({error: err});
		})
})



// TODO GET /api/state/:state
app.get('/api/state/:state', function(req, res) {
	res.contentType('application/json')
	var state = req.params.state
	db.findCitiesByState(state, {offset: 0, limit: 10})
		.then(function(result) {
			newResult = result.map(element => {
				return '/api/city/' + element;
			});
			res.json(newResult)
		})
		.catch(err => {
			res.status(400)
			res.json({error: err});
		})
})



// TODO GET /api/city/:cityId
app.get('/api/city/:cityId', function(req, res) {
	res.contentType('application/json')
	var cityId = req.params.cityId

	db.findCityById(cityId).then(function(result) {
		res.json(result)
	}).catch(err => {
		res.status(400)
		res.json({error: err});
	})
})


// TODO POST /api/city
app.post('/api/city', function(req, res) {
	res.contentType('application/json')
	res.contentType('application/json')
	var data={};
	data.city = req.body.city
	data.loc = req.body.loc
	data.pop = req.body.pop
	data.state = req.body.state

	res.send('You send: '+ JSON.stringify(data));
	
});



// Optional workshop
// TODO HEAD /api/state/:state



// TODO GET /state/:state/count



// TODO GET /city/:name



// End of workshop

db.getDB()
	.then((db) => {
		const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000;

		console.info('Connected to MongoDB. Starting application');
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`);
		});
	})
	.catch(error => {
		console.error('Cannot connect to mongo: ', error);
		process.exit(1);
	});
