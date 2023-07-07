# Fastify API

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)


This is a RESTful API built with Fastify and MongoDB. It provides endpoints to manage products.

## Features

- Create, retrieve, update, and delete products
- Validate product name and icon
- Store products in MongoDB
- Serve static files

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/fastify-api.git
   ```
Install the dependencies:

```bash
cd fastify-api
npm install
```
Create a **.env** file in the project root and set the following variables:

```makefile
MONGO_URL=mongodb://localhost:27017
MONGO_DBNAME=my-database
```
Build the project:

```bash
npm run build
```
Start the server:

```bash
npm start
```
The API will be accessible at http://localhost:8090.

## Development
To develop and make changes to the API, you can use the following npm scripts:

**npm run dev**: Starts the server in development mode with auto-reloading on file changes.
**npm run lint**: Runs ESLint to check the code for linting errors.
**npm run test**: Runs the unit tests using Jest.
Feel free to explore the codebase and make any necessary modifications to suit your needs.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

### License
This project is licensed under the MIT License.