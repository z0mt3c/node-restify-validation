module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Project configuration.
    grunt.initConfig({
        mochacli: {
            options: {
                reporter: 'dot'
            },
            all: ['test/{,*/}*.js']
        },
        watch: {
            scripts: {
                files: ['<%= jshint.all %>'],
                tasks: ['default']
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'lib/*.js',
                'test/*.js',
                'index.js'
            ]
        },
        mochacov: {
            coverage: {
                options: {
                    coveralls: {
                        serviceName: 'travis-ci'
                    }
                }
            },
            test: {
                options: {
                    reporter: 'spec'
                }
            },
            options: {
                files: 'test/*.js',
                require: ['should']
            }
        }
    });

    // Default task.
    grunt.registerTask('test', ['jshint', 'mochacli']);
    grunt.registerTask('travis', ['test','mochacov:coverage']);
    grunt.registerTask('default', ['test']);
};
