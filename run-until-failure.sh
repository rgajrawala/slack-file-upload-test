#!/bin/bash

while true
do
  ./index.js
  if [ $? -eq 1 ]
  then
    echo 'Upload failed. Exiting...'
    break
  fi

  echo 'Successful upload, trying again...'
done
