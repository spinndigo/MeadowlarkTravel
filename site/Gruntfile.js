module.exports = function(grunt){
    [
        'grunt-mocha-test',
        'grunt-exec',
        'grunt-contrib-jshint'
    ].forEach(function(task){
        grunt.loadNpmTasks(task);
    });

    grunt.initConfig({
        mochaTest: {
            all: {src: 'qa/tests-*.js', options: {ui: 'tdd'}}
        },
        jshint: {
            app: ['meadowlark.js' , 'public/js/**/*.js', 'lib/**/*.js'],
            qa: ['Gruntfile.js', 'public/qa/**/*.js' , 'qa/**/*.js'],
        
        },
        exec: {
            linkChecker: {cmd: 'linkchecker http://localhost:3000'}
        },
    });

    grunt.registerTask('default' , ['mochaTest' , 'jshint' , 'exec']);

}