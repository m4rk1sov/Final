# Node.js and MongoDB Registration and Login System

This project is a simple user registration and login system built with Node.js, Express, MongoDB, and Passport.js. It demonstrates basic authentication, password hashing, and session management in a Node.js application.

## Features

- User Registration
- User Login
- Password Hashing with bcryptjs
- Session Management with express-session
- Authentication with Passport.js
- Flash messages for user interaction feedback

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed the latest version of [Node.js and npm](https://nodejs.org/en/)
- You have a MongoDB server running locally or remotely
- You have a basic understanding of JavaScript and Node.js

### Installing

- Navigate to the project directory:
  ```bash
  cd [project-directory]
  ```
- Install required npm packages:
  ```bash
  npm install express mongoose bcryptjs body-parser express-session ejs passport passport-local method-override express-flash dotenv
  ```

### Setting up the Database

create a database, e.g.: use web2ass1
create a collection, e.g.: db.createCollection("User")

### Configuring Environment Variables

Create a `.env` file in the root of the project with the following variables:

SESSION_SECRET=[Your session secret]

### Running the Application

- Start the server:
  ```bash
  node server.js OR npm run devStart
  ```
- Access the application through `http://localhost:3000` in your browser.

## Usage

By using /register page, insert data - username, email, password it will send the data to PostgreSQL.
Afterwards, through /login page, confirm the data and enter to the home page

## Contributing

Feel free to contribute and change the code as you wish

## License

There is no license for this project