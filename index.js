const express = require('express')
const app = express()
require('dotenv').config()

const Person = require('./models/phonebook')

const morgan = require('morgan')

morgan.token('body', function getBody (req) {
    return JSON.stringify(req.body);
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let data = []

app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const cors = require('cors')

app.use(cors())

app.use(express.json())
app.use(requestLogger)


app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        response.json(result)
    })
})

app.get('/info', (request, response) => {
    const date = new Date();

    Person.countDocuments({})
        .then(count => {
            response.send(
                '<div>Phonebook has info for ' + count + ' people' 
                + '<br/><br/>' + date.toString() +  '</div>')
        })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    Person.findById(id)
        .then(foundPerson => {
            response.json(foundPerson)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    //const new_id = Math.floor(Math.random() * 10000)
    const body = request.body;

    if (!body.name && !body.number) {
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }

    if (data.some(person => person.name == body.name)) {
        return response.status(400).json({
            error: 'name must be uniques'
        })
    }

    const person = new Person ({
        //id: new_id,
        name: body.name,
        number: body.number,   
    })

    person.save()
        .then(result => {
            console.log(`added ${result.name} number ${result.number} to phonebook`)
            response.json(person)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(
        request.params.id, 
        person, 
        { new : true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
