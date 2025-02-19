import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'

const app = express()

app.use(cors()) // Enable CORS

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

app.use((request, response) => {
  response.status(404).send('Not Found')
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})