const fs = require('fs');

// Read the service account JSON file
const serviceAccountJson = fs.readFileSync('firebase-service-account.json', 'utf8');

// Base64 encode the JSON string
const base64EncodedJson = Buffer.from(serviceAccountJson).toString('base64');

// Print the Base64 encoded string
console.log(base64EncodedJson);