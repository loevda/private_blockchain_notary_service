# Private Blockchain Notary Service

## Setup project

To setup the project do the following:
1. Clone the project.
2. Run __npm install__ to install the project dependencies.
3. Run __npm start__ to run the server. Server is listening at **http://localhost:8000**.

## Endpoints

| endpoint                    | method | description                                                                 | 
|-----------------------------|--------|-----------------------------------------------------------------------------|
| /                           | GET    | List of available endpoints                                                 |
| /requestValidation          | POST   | Request a validation. Payload takes an address                              |
| /message-signature/validate | POST   | Process a validation. Payload takes an {address} and a {signature} in body  | 
| /block                      | POST   | Add a star block. Payload takes an {address} and a {star} object.           |
| /stars/[hash]               | GET    | Get the star block with an hash of {hash}                                   |

