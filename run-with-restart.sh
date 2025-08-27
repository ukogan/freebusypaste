#!/bin/bash

echo "Starting FreeBusy Desktop with auto-restart..."

while true; do
    echo "$(date): Starting FreeBusy..."
    npm start
    
    exit_code=$?
    echo "$(date): FreeBusy exited with code $exit_code"
    
    if [ $exit_code -eq 0 ]; then
        echo "Normal exit, stopping..."
        break
    fi
    
    echo "Crash detected, restarting in 3 seconds..."
    sleep 3
done