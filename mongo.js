const mongoose = require("mongoose");
require("dotenv").config();

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const phone = process.argv[4];

const addPerson = name === undefined || phone === undefined ? false : true;

const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: String,
  phone: String
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name: name,
  phone: phone
});

if (addPerson) {
  person.save().then(response => {
    console.log(`added ${name} number ${phone} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then(result => {
    console.log(`phonebook:`);
    result.forEach(person => {
      console.log(person);
    });
    mongoose.connection.close();
  });
}
