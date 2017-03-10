module.exports = function (grunt) {
    grunt.initConfig({
        browserify: {
            options: {
                browserifyOptions: {
                    debug: true
                },
                watch: false
            },
            app: {
                files: {
                    'public/js/rpsApp.js': ['src/rpsApp.js']
                }
            }
        },
        uglify: {
            options: {
                sourceMap: true
            },
            app: {
                files: [
                    {
                       'public/js/rpsApp.min.js': ['public/js/rpsApp.js']
                    }
                ]
            }
        },
        watch: {
            app: {
                files: ['src/**/*.js'],
                tasks: ['browserify:app']
            },
            dist: {
                files: ['public/js/rpsApp.js'],
                tasks: ['uglify:app']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');

};
