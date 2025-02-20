import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync } from 'fs' 
import morgan from 'morgan'

const app = express()

app.use(express.static('dist')) // Serve static files from dist folder
//Morgana
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}))

app.use(cors()) // Enable CORS
app.use(express.json()) // Enable JSON parsing

const data = JSON.parse(readFileSync('./db.json', 'utf-8'))
const persons = data.persons

app.get('/api/persons', (request, response) => {
  response.json({ persons })
})


// Corrige la ruta aquí
app.get('/api/info', (request, response) => {
  response.send(
    `Phonebook has info for ${persons.length} people 
    ${new Date()}`
  )
})

// Necesaría para sacar la información de una sola entrada en la agenda
app.get('/api/info/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// Necesaria para eliminar una entrada específica de la agenda según su id
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const index = persons.findIndex(person => person.id === id)
  if (index !== -1) {
    persons.splice(index, 1)
    writeFileSync('./db.json', JSON.stringify({ persons }, null, 2)) // Guardar cambios en db.json writeFileSync('./db.json', JSON.stringify({ persons }, null, 2)) // Guardar cambios en db.json
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

app.use('/api/createpersons', morgan('combined'))

app.post('/api/createpersons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }
  console.log('body', body.name, body.number, persons)
  const existingPerson = persons.find(person => person.name === body.name)
  console.log('existingPerson', existingPerson)
  if (existingPerson) {
    return response.status(400).json({ error: 'name must be unique' })
  }
  const maxId = persons.length > 0 ? Math.max(...persons.map(person => parseInt(person.id))) : 0
  const person = {
    id: (maxId + 1).toString(),
    name: body.name,
    number: body.number
  }
  persons.push(person)
  writeFileSync('./db.json', JSON.stringify({ persons }, null, 2)) // Guardar cambios en db.json
  response.json(person)
})


app.use((request, response) => {
  response.status(404).send('Not Found')
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})