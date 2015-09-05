# Ispolin

An efficient gamified system for learning programming.

Written in Typescript, built on top of Nodejs, automated via Grunt.

# Setup

You need to have Nodejs (> 0.12) and MongoDB.

Open your terminal and run:

```
git clone git@github.com:nikoladimitroff/Ispolin.git
setup.bat
grunt run-db
grunt run
start http://localhost:8080
```

Currently there are two courses - Game Engine Architecture (GEA) and
High Performance Computing (HPC). When you click on the lectures tab,
you'll see lectures for **one** course. To change which one, open
/src/server/server.ts and change `FIXED_COURSE` to either `"GEA"` or `"HPC"`.

While writing lectures, you can also open
*http://localhost:8080/3rdparty/reveal.js/presentation-iframe.html*. This way
you'll see the last selected lecture from the lectures menu in full screen.

