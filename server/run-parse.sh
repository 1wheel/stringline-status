#ncat -k -l 127.0.0.1 4445
while ! node parse.js
  do sleep 1
  echo 'restarting parse'
done