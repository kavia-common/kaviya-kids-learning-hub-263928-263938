#!/bin/bash
cd /home/kavia/workspace/code-generation/kaviya-kids-learning-hub-263928-263938/kaviya_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

