/* jslint node: true */
"use strict";

var rutas = {
  js: ['*.js', 'public/**/*.js']
};

module.exports = function(grunt) {
    // Project configuration.
  grunt.initConfig({
    pkg     : grunt.file.readJSON('package.json'),

    bgShell: {
      runNode: {
        cmd: 'node app.js',
        bg: true
      }
    },

    nodemon: {
      dev: {
        script: 'app.js'
      }
    },

    watch: {
          js: {
            files: rutas.js,
            options: {
              livereload: true
            }
          }
        }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-nodemon');

    // Default task(s).
  grunt.registerTask('default', ['bgShell:runNode', 'watch']);

  grunt.registerTask('test', []);

};
