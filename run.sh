#!/bin/bash

npm run build
if [ $? -ne 0 ]; then
  echo "Build failed. Exiting."
  exit 1
fi
node dist/index.js
if [ $? -ne 0 ]; then
  echo "Execution failed. Exiting."
  exit 1
fi
echo "Script executed successfully."
