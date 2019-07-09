const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();
const Person = require("./models/person");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("build"));

morgan.token("body", function(req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status - :response-time ms - :res[content-length] - :body (:date[web])"
  )
);

app.get("/api/info", (req, res) => {
  Person.count({}, (err, count) => {
    let body = `<p>Phonebook has info for ${count} people</p>`;
    body += `<p>${new Date()}</p>`;
    res.send(body);
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(p => p.toJSON()));
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then(p => {
    response.json(p.toJSON());
  });
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id, (err, todo) => {
    if (err) return res.status(500).send(err);
    response.status(204).end();
  });
});

const validateBodyPerson = (body, response) => {
  if (!body.name) {
    return "name missing";
  }

  if (!body.phone) {
    return "phone missing";
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
  const person = new Person({
    name: body.name,
    phone: body.phone
  });

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON());
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
