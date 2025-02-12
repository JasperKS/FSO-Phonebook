const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI;

mongoose.connect(url)
    .then(result => {
        console.log('connect to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB', error.message)
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)

module.exports = mongoose.model('Person', personSchema)

// if (process.argv.length == 5) {
//     let name = process.argv[3]
//     let number = process.argv[4]

//     const person = new Person({
//         name: name,
//         number: number,
//     })

//     person.save().then(result => {
//         console.log(`added ${result.name} number ${result.number} to phonebook`)
//         mongoose.connection.close()
//     })
    
// } else if (process.argv.length == 3) {
//     Person.find({}).then(result => {
//         console.log("phonebook:")
//         result.forEach(person => {
//             console.log(`${person.name} ${person.number}`)
//         })
//         mongoose.connection.close()
//     })
    
// } else {
//     console.log("wrong number of arguments")
//     mongoose.connection.close()
// }


