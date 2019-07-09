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

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons.map(person => person.toJSON()));
    })
    .catch(error => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON());
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

const validateBodyPerson = (body, response) => {
  if (!body.name) {
    return "name missing";
  }

  if (!body.phone) {
    return "phone missing";
  }
};

app.post("/api/persons", (request, response, next) => {
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

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON());
    })
    .catch(error => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  console.log("request", request.body);
  const body = request.body;

  const person = {
    name: body.name,
    phone: body.phone
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatePerson => {
      if (updatePerson) {
        response.json(updatePerson.toJSON());
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind == "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
