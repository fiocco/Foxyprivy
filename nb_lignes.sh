#!/bin/bash

echo "Pour le XUL : \n"
echo "-------------\n"
find . -name "*.xul" | xargs wc -l
echo "\n"
echo "Pour le JS : \n"
echo "------------\n"
find . -name "*.js" | xargs wc -l
