const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const UserSchema = new mongoose.Schema({
	username: String,
})

const ExerciseSchema = new mongoose.Schema({
	id: String,
	description: String,
	duration: Number,
	date: Date,
})

const LogSchema = new mongoose.Schema({
	username: String,
	count: Number,
	log: [{description: String, duration: Number, date: String}]
})

const User = mongoose.model('User', UserSchema) 
const Exercise = mongoose.model('Exercise', ExerciseSchema)
const Log = mongoose.model('Log', LogSchema)



app.post("/api/users", async (req,res) => {
	const username = req.body.username;

	const newUser = new User({
		username: username
	})

	try {
		const savedUser = await newUser.save()
		res.json({
			username:username,
			_id: savedUser._id
		})
	} catch (error) {
		return console.error(error)
	}
})

app.get("/api/users", async (req,res) => {
	try {
		const users = await User.find({})
		res.json(users)
	} catch (error) {
		return console.error(error)
	}
})

app.post("/api/users/:_id/exercises", async (req,res) => {
	let { description, duration, date } = req.body;
	duration = Number(duration);
	const { _id } = req.params

	if(date == undefined || date == "") date = new Date().toDateString()
	else date = new Date(date).toDateString()
	
	const user = await User.findById(_id)

	const newExercise = new Exercise({
		id: _id,
		description: description,
		duration: duration,
		date: date
	})

	try {
		const savedExercise = await newExercise.save()
		res.json({
			_id:user._id,
			username:user.username,
			description: newExercise.description,
			duration: newExercise.duration,
			date: newExercise.date.toDateString()
		})
	} catch (error) {
		return console.error(error)
	}
})

app.get("/api/users/:_id/logs?", async (req,res) => {
	const { _id } = req.params
	const { from = new Date(0), to = new Date(), limit=1000 } = req.query

	
	try {
		const exercises = await Exercise.find({id: _id, date: {$gte: from, $lte: to}} ).limit(limit)
		const user = await User.findById(_id)

		const log = new Log({
			_id: user._id,
			username: user.username,
			count: exercises.length,
			log: exercises.map((exercise) => ({
				description: exercise.description,
				duration: exercise.duration,
				date: exercise.date.toDateString()
			}))
		})

		res.json(log)
	} catch (error) {
		return console.error(error)
	}
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
