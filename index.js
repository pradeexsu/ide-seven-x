var request = require('request')
const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
app = new express()

app.use(express.urlencoded({ extended: true }));
const bodyParser = require('body-parser')
app.set('view engine', 'ejs')

app.use(bodyParser.json())
// app.use(express.static(__dirname ))
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/public/jQuery/'))
app.use(express.static(__dirname + '/public/imgs/'))
app.use(express.static(__dirname + '/public/codemirror/css/'))
app.use(express.static(__dirname + '/public/codemirror/languages/'))
app.use(express.static(__dirname + '/public/codemirror/themes/'))
app.use(express.static(__dirname + '/public/codemirror/js/'))
app.use(express.static(__dirname + '/public/codemirror/js/features/'))
app.use(express.static(__dirname + '/public/codemirror/js/features/comments/'))
app.use(express.static(__dirname + '/public/codemirror/js/features/foldcode/'))

const dbURI = process.env.MONGO_URI
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

// const dbURI = `mongodb://localhost:27017/ideseven`


mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
	console.log("db connected")
}).catch((err) => {
	console.log(err)
})


const codeSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: true

	},
	title: {
		type: String,
		required: false

	},
	mode: {
		type: String,
		required: true
	},
	code: {
		type: String,
		required: true
	},
	input: {
		type: String,
		required: false
	}
}, { timestamps: true })

const Code = new mongoose.model("SavedCode", codeSchema)

async function getCode(codeid) {
	try {
		const promis = await Code.find({ _id: codeid })
		return promis
		// console.log(promis)
	} catch (err) {
		console.error(err)
	}
}

app.use(express.urlencoded({
	extended: true
}))


app.get('/', (req, res) => {
	res.render('index', {
		input: '',
		code: '',
		mode: ''
	})
})


app.get('/:id/', async (req, res) => {

	getCode(req.params.id).then(async (result) => {

		if (await result === []) {
			res.redirect('/')
		}
		else {
			res.render('index', {
				input: await result[0].input,
				code: await result[0].code,
				mode: await result[0].mode
			})
		}
	}).catch(error => {
		res.redirect('/')
	})

})
app.post('/running', (req, res) => {

	var program = {
		clientId: clientId,
		clientSecret: clientSecret,
		script: req.body.code,
		stdin: req.body.input,
		language: req.body.language,
		versionIndex: 0
	}

	request({
		url: 'https://api.jdoodle.com/v1/execute',
		method: "POST",
		json: JSON.stringify(program)
	},
		function (error, response, body) {
			// console.log('error:', error)
			// console.log('statusCode:', response && response.statusCode)
			// console.log('body:', body)
			res.json(body)
			res.end()
		})
})



app.post('/save', async (req, res) => {

	let program = {
		_id: req.body._id,
		code: req.body.code,
		input: req.body.input,
		mode: req.body.language
	}

	try {
		const demoCode = new Code(program)
		demoCode.save().then(async (feedback) => {
			// console.log(await feedback)
			if (await feedback)
				await res.redirect('/' + req.body._id)
		})

	} catch (err) {
		// console.error(err)
		return
	}

})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}....`))