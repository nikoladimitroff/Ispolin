xcopy githooks\* .git\hooks\ /s /y

mkdir distr
cd distr
mkdir server
mkdir client
cd ..

npm install
npm install grunt-cli -g
npm install tsd -g
tsd reinstall -so