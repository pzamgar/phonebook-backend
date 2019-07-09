const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

morgan.token("body", function(req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status - :response-time ms - :res[content-length] - :body (:date[web])"
  )
);

let persons = [
  {
    name: "Arto Hellas",
    phone: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    phone: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    phone: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    phone: "39-23-6423122",
    id: 4
  }
];

app.get("/api/info", (req, res) => {
  let body = `<p>Phonebook has info for ${persons.length} people</p>`;
  body += `<p>${new Date()}</p>`;

  res.send(body);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(p => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(p => p.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const min = Math.ceil(0);
  const max = Math.floor(999999999);
  return Math.floor(Math.random() * (max - min)) + min;
};

const validateBodyPerson = (body, response) => {
  if (!body.name) {
    return "name missing";
  }

  if (!body.phone) {
    return "phone missing";
  }

  const person = persons.find(p => p.name === body.name);
  if (person) {
    return "name must be unique";
  }
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  const error = validateBodyPerson(body, response);
  if (error) {
    return response.status(400).json({
      error: error
    });
  }

  const person = {
    name: body.name,
    phone: body.phone,
    id: generateId()
  };

  persons = persons.concat(person);

  response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
