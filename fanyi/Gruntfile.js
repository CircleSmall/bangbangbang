module.exports = function(grunt) {

    // 项目配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%=pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            },
            release: { //任务四：合并压缩a.js和b.js
                files: {
                    'output/index.min.js': ['js/jquery-1.11.1.min.js', 'js/index.js']
                }
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            compress: {
                files: {
                    'output/index.min.css': [
                        "css/reset.css",
                        "css/base.css"
                    ]
                }
            }
        },
        watch: {
            files: ['css/*.css','js/*.js'],
            tasks: ['uglify:release', 'cssmin']
        }
    });

    // 加载提供"uglify"任务的插件
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 默认任务
    grunt.registerTask('default', ['uglify:release', 'cssmin', 'watch']);
}