module.exports = function(grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    mochacli: {
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
        'test/*.js'
      ]
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'mochacli']);
};