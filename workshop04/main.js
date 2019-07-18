const { join } = require('path');
const fs = require('fs');
const uuid = require('uuid/v1')

const cacheControl = require('express-cache-controller')
const preconditions = require('express-preconditions')
const cors = require('cors');
const range = require('express-range')
const compression = require('compression')

const { Validator, ValidationError } = require('express-json-validator-middleware')
const  OpenAPIValidator  = require('express-openapi-validator').OpenApiValidator;

const schemaValidator = new Validator({ allErrors: true, verbose: true });

const consul = require('consul')({ promisify: true });

const express = require('express')

const CitiesDB = require('./citiesdb');

const serviceId = uuid().substring(0, 8);
const serviceName = `zips-${serviceId}`

//Load application keys
//Rename _keys.json file to keys.json
const keys = require('./keys.json')

console.info(`Using ${keys.mongo}`);

// TODO change your databaseName and collectioName 
// if they are not the defaults below
const db = CitiesDB({  
	connectionUrl: keys.mongo, 
	databaseName: 'zips', 
	collectionName: 'city'
});

const app = express();

//Disable etag for this workshop
app.set('etag', false);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start of workshop

// TODO 1/3 Load schemans




// TODO 2/3 Copy your routes from workshop03 here
// Start of workshop
// TODO 2/2 Copy your routes from workshop02 here
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
	schemaValidator.validate({body: citySchema});

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

// End of workshop




// End of workshop

app.get('/health', (req, resp) => {
	console.info(`health check: ${new Date()}`)
	resp.status(200)
		.type('application/json')
		.json({ time: (new Date()).toGMTString() })
})

app.use('/schema', express.static(join(__dirname, 'schema')));

app.use((error, req, resp, next) => {
	if (error instanceof ValidationError)
		return resp.status(400).type('application/json').json({ error: error });
	else if (error.status)
		return resp.status(400).type('application/json').json({ error: error });
	next();
});

db.getDB()
	.then((db) => {
		const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000;

		console.info('Connected to MongoDB. Starting application');
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`);
			console.info(`\tService id: ${serviceId}`);

			// TODO 3/3 Add service registration here




		});
	})
	.catch(error => {
		console.error('Cannot connect to mongo: ', error);
		process.exit(1);
	});
