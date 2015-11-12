var path = require("path");
var EOL = require('os').EOL;


module.exports = function (grunt) {
    var settings = grunt.file.readJSON('local_grunt_settings.json');
    // Project configuration.
    grunt.initConfig({
        watch: {
            options: {
                interrupt: true,
                atBegin: true
            },
            html: {
                files: ["components/**/*.html", "index.html", "course_index.html"],
                tasks: settings.htmlTasks,
            },
            css: {
                files: "styles/**/*.less",
                tasks: settings.cssTasks,
            },
            ts: {
                files: "src/**/*.ts",
                tasks: settings.tsTasks,
            },
            content: {
                files: ["resources/**", "courses/**"],
                tasks: ["newer:copy:resources", "newer:copy:courses"]
            },
            libs: {
                files: ["styles/fonts/*", "styles/cursors/*"],
                tasks: ["copy:client"]
            }
        },
        less: {
            options: {
                paths: ["styles/**/*.less"]
            },
            client: {
                files: {
                    "distr/client/main.css": "styles/less/main.less",
                    "distr/client/index.css": "styles/less/index.less"
                }
            },
        },
        ts: {
            options: {
                module: "commonjs",
                fast: "never",
                noImplicitAny: true,
            },
            debug: {
                files: [
                    // index.ts is only used on the main page
                    { src: ["src/client/index.ts"], dest: "distr/client/index.js" },
                    { src: [
                        "src/client/**/*.ts",
                        "src/common/**/*.ts",
                        "!src/client/index.ts"
                      ],
                      dest: "distr/client/app.js"
                    },
                    // Typescript will see that files in src/server are depedent
                    // on files in src/common and will put 'em in correct dirs
                    { src: ["src/server/**/*.ts"], dest: "distr/" },
                ],
                inlineSources: true,
                preserveConstEnums: true
            },
            release: {
                files: [
                    { src: "src/client/index.ts", dest: "distr/client/index.js" },
                    { src: [
                        "src/client/**/*.ts",
                        "src/common/**/*.ts",
                        "!src/client/index.ts"
                      ],
                      dest: "distr/client/app.js" },
                    { src: ["src/server/**/*.ts"], dest: "distr/" },
                ],
                sourceMap: false
            }
        },
        concat: {
            options: {
                banner: grunt.file.read("course_index.html"),
                process: function(src, filepath) {
                    var containerDir = path.basename(path.dirname(filepath));
                    var prefix = "";
                    if (containerDir === "views") {
                        prefix = "view!";
                    }
                    var name = path.basename(filepath, path.extname(filepath));
                    name = name.replace("_", "-");
                    return EOL +
                           "<script id='" + prefix + name + "' " +
                           "type='text/html' class='component' >" +
                                src +
                           "</script>"
                },
            },
            client: {
                files: [{
                    src: ["components/**/*.html"],
                    dest: "distr/client/course_index.html"
                }],
            }
        },
        copy: {
            client: {
                files: [
                    { expand: true, flatten: true, src: "styles/cursors/*", dest: "distr/client/cursors/" },
                    { expand: true, flatten: true, src: "styles/fonts/*", dest: "distr/client/fonts/" },
                    { expand: true, src: "3rdparty/**", dest: "distr/client/" },
                    // 3rdparty scripts installed via npm below
                    { expand: false, src: "node_modules/knockout/build/output/knockout-latest.js", dest: "distr/client/3rdparty/knockout-latest.js" },
                    { expand: false, src: "node_modules/q/q.js", dest: "distr/client/3rdparty/q.js" },
                    { expand: false, src: "node_modules/font-awesome/css/font-awesome.min.css", dest: "distr/client/3rdparty/font-awesome/css/font-awesome.min.css" },
                    { expand: true, flatten: true, src: "node_modules/font-awesome/fonts/*", dest: "distr/client/3rdparty/font-awesome/fonts/"},
                ]
            },
            resources: {
                files: [
                    { expand: true, src: "resources/**", dest: "distr/client/" },
                ]
            },
            courses: {
                files: [
                    { expand: true, src: "courses/**", dest: "distr/client/" },
                ]
            },
            "system-index": {
                files: [
                    { expand: false, src: "index.html", dest: "distr/client/index.html" },
                ]
            },
            source: {
                files: [
                    { expand: true, src: "src/**", dest: "distr/client/" }
                ]
            }
        },
        mochaTest: {
            options: {
                reporter: "spec",
            },
            src: ["tests/**/main.js"]
        },
        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            client: {
                src: ["src/client/**/*.ts"]
            },
            server: {
                src: ["src/server/**/*.ts", "src/common/**/*.ts"]
            }
        },
        clean: {
            server: ["distr/server/", "distr/common/"],
            client: ["distr/client/"],
        },
        nodemon: {
            dev: {
                script: "distr/server/main.js"
            },
            options: {
                watch: ["distr/", "!distr/client"],
                env: {
                    PORT: "8080"
                }
            }
        },
        concurrent: {
            "run-server": {
                tasks: ["nodemon", "watch"],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        shell: {
            mongodb: {
                command: 'mongod --dbpath ./data/db --port 27017',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        cwd: '.'
                    }
                }
            },
            "repopulate-db": {
                command: 'node distr/server/populate_test_data.js | bunyan',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        cwd: '.',
                        timeout: 1000
                    }
                }
            },
            "dump-db": {
                command: 'node distr/server/dump_db.js | bunyan',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        cwd: '.',
                        timeout: 1000
                    }
                }
            },
        }
    });

    require("load-grunt-tasks")(grunt);

    // Alias common tasks
    grunt.registerTask("run", ["concurrent:run-server"]);
    grunt.registerTask("run-db", ["shell:mongodb"]);
    grunt.registerTask("repopulate", ["shell:repopulate-db"]);
    grunt.registerTask("dump", ["shell:dump-db"]);
    grunt.registerTask("test", ["mochaTest"]);
    grunt.registerTask("lint", ["tslint"]);

    var validPlatforms = ["server", "client"];
    var validConfigurations = ["debug", "release"];
    grunt.registerTask("build", "Builds the entire app.", function (platform, configuration) {
        var platforms = [platform];
        var configurations = [configuration];
        if (!configuration) {
            configurations = validConfigurations;
        }
        else if (validConfigurations.indexOf(configuration) < 0) {
            grunt.fail.fatal("Invalid configuration!");
        }

        if (!platform) {
            platforms = validPlatforms;
        }
        else if (validPlatforms.indexOf(platform) < 0) {
            grunt.fail.fatal("Invalid platform!");
        }
        for (var i = 0; i < platforms.length; i++) {
            var platform = platforms[i];
            for (var j = 0; j < configurations.length; j++) {
                var clientTasks = [
                    "lint:" + platform,
                    "mochaTest",
                    "clean:" + platform,
                    "copy:" + platform,
                    "concat:" + platform,
                    "ts:" + configuration
                ];
                var serverTasks = [
                    "lint:" + platform,
                    "mochaTest",
                    "clean:" + platform,
                    "ts:" + configuration
                ];
                var tasks = platform === "server" ? serverTasks : clientTasks;
                grunt.task.run(tasks);
            }
        }
    });
};
