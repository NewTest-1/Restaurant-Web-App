#!/bin/bash
echo "Building project..."
npm install
npm run build

echo "Deploying to Firebase..."
firebase deploy --only hosting

echo "Done 🚀"
