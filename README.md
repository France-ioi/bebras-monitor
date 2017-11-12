
# Installation

Install nvm, node (8.9.1+), and install yarn globally.
Run this command in the project's directory to install dependencies:

    yarn install

Start the server in development mode with this command:

    LISTEN=8020 REDIS_URL=redis://172.16.0.1:6379 npm run develop

Start the server in production mode with this command:

    LISTEN=8020 REDIS_URL=redis://172.16.0.1:6379 npm start
