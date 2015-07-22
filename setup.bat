xcopy githooks\* .git\hooks\ /s /y

mkdir distr\server
mkdir distr\client
mkdir data\db

npm install
npm install grunt-cli -g
npm install tsd -g
tsd reinstall -so
grunt build