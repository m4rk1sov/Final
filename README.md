# Node.js Portfolio project

This project is a simple portfolio with CRUD, implementing authentication with user registration and login system built with Node.js, Express, MongoDB and others. It demonstrates basic authentication, password hashing, and session management in a Node.js application. There are 2 roles: "user" and "admin". CRUD is permitted to admin and users can read-only. There are also additional 3 APIs for better experience.

## Features

- User Registration
- User Login
- Password Hashing with bcryptjs
- Session Management with express-session
- Authentication with Passport.js
- Flash messages for user interaction feedback
- CRUD for blog system
- 3 APIs
- Role system

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed the latest version of [Node.js and npm](https://nodejs.org/en/)
- You have a MongoDB server running locally or remotely (Atlas Cluster)
- You have a basic understanding of JavaScript and Node.js

### Installing

- Navigate to the project directory:
  ```bash
  cd [project-directory]
  ```
- Install required npm packages:
  ```bash
  npm install express mongoose bcryptjs body-parser express-session ejs passport passport-local method-override express-flash dotenv axios fs multer mongodb nodemon path connect-mongo bcrypt express-session
  ```

### Setting up the Database

create a database, e.g.: use Portfolio
create a collection, e.g.: db.createCollection("test")

### Configuring Environment Variables

Create a `.env` file in the root of the project with the following variables:

SESSION_SECRET=[Your session secret]
MONGODB_URI="your mongo URL" 
... and so on

### Running the Application

- Start the server:
  ```bash
  node server.js OR npm run devStart
  ```
- Access the application through `http://localhost:3000` in your browser.

## Usage

By using /register page, insert data - username, email, password it will send the data to PostgreSQL.
Afterwards, through /login page, confirm the data and enter to the home page
Manipulate roles and CRUD for blogs and use APIs

## Contributing

Feel free to contribute and change the code as you wish

## License

There is no license for this project
