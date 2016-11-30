
# Installation

Install dependencies:

    npm install -g jspm@beta
    npm install
    jspm install

Run in a production environment:

    npm run build
    LISTEN=8001 npm start

Run in a development environment:

    npm run bundle-build
    npm run bundle-deps
    LISTEN=8001 npm run develop
