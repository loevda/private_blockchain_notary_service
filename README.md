# Private Blockchain Notary Service

## Setup project for Review.

To setup the project for review do the following:
1. Clone the project.
2. Run command __npm install__ to install the project dependencies.
3. Run __npm start__ to run the server. Server is listening at **http://localhost:8000**.

## Endpoints

| endpoint             | method | description                                     | 
|----------------------|--------|-------------------------------------------------|
| /                    | GET    | List of available endpoints                     |
| /block/[blockheight] | GET    | Return block at height of {number} blockheight. |
| /block               | POST   | Add a new block to the blockchain. Payload takes either an url-encoded key/value pair (body=value) or a json object {'body': 'value'}.       |     

