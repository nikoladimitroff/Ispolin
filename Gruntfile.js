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
                files: ["views/**/*.html", "index.html", "course_index.html"],
                tasks: settings.htmlTasks,
            },
            css: {
                files: "style/less/*.less",
                tasks: settings.cssTasks,
            },
            ts: {
                files: "src/**/*.ts",
                tasks: settings.tsTasks,
            },
        },
        less: {
            options: {
                paths: ["style/less/*.less"]
            },
            client: {
                files: {
                    "distr/client/main.css": "style/less/main.less"
                }
            },
        },
        ts: {
            options: {
                module: "commonjs",
                fast: "never"
            },
            debug: {
                files: [
                    // index.ts is only used on the main page
                    { src: ["src/client/**/*.ts", "!src/client/index.ts"],
                      dest: "distr/client/app.js" },
                    { src: ["src/client/index.ts"], dest: "distr/client/index.js" },
                    { src: ["src/server/**/*.ts"], dest: "distr/server" }
                ],
                inlineSources: true,
                preserveConstEnums: true
            },
            release: {
                files: [
                    { src: ["src/client/**/*.ts", "!src/client/**/index.ts"],
                      dest: "distr/client/app.js" },
                    { src: ["src/client/**/index.ts"], dest: "distr/client/index.js" },
                    { src: ["src/server/**/*.ts"], dest: "distr/server" }
                ],
                sourceMap: false
            }
        },
        concat: {
            options: {
                banner: grunt.file.read("course_index.html"),
                process: function(src, filepath) {
                    var viewName = path.basename(filepath, path.extname(filepath));
                    return EOL +
                           "<script type='text/html' id='" + viewName + "'>" +
                              src +
                           "</script>"
                },
            },
            client: {
                files: [{
                    src: ["views/*.html"],
                    dest: "distr/client/course_index.html"
                }],
            }
        },
        copy: {
            client: {
                files: [
                    { expand: false, src: "index.html", dest: "distr/client/index.html" },
                    { expand: true, flatten: true, src: "styles/cursors/*", dest: "distr/client/cursors/" },
                    { expand: true, flatten: true, src: "styles/fonts/*", dest: "distr/client/fonts/" },
                    // 3rdparty scripts below
                    { expand: false, src: "node_modules/knockout/build/output/knockout-latest.js", dest: "distr/client/3rdparty/knockout-latest.js" },
                ]
            },
            "system-index": {
                files: [
                    { expand: false, src: "index.html", dest: "distr/client/index.html" },
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
                src: ["src/server/**/*.ts"]
            }
        },
        clean: {
            server: ["distr/server/"],
            client: ["distr/client/"],
        }
    });

    require('load-grunt-tasks')(grunt);
    
    grunt.event.on('watch', function(action, filepath, target) {
        var tasks = settings[target + "Tasks"];
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
        grunt.config(tasks, filepath);
    });

    grunt.registerTask("test", ["mochaTest"]);
    grunt.registerTask("lint", ["tslint"]);

    var validPlatforms = ["server", "client"];
    var validConfigurations = ["debug", "release"];
    grunt.registerTask("build", "Builds the entire app.", function (platform, configuration) {
        var platforms = [];
        var configurations = [];
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
                    "lint",
                    "mochaTest",
                    "clean:" + platform,
                    "copy:" + platform,
                    "concat:" + platform,
                    "ts:" + configuration
                ];
                var serverTasks = [
                    "lint",
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
