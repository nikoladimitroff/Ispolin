xcopy githooks\* .git\hooks\ /s /y

mkdir distr\server
mkdir distr\client
mkdir data\db

npm install
npm install -g grunt-cli
npm install -g tsd
npm install -g bunyan
tsd reinstall -so
grunt build
