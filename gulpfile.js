var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    mix.styles([
        'buttons.bootstrap.min.css',
        'dataTables.bootstrap.min.css',
        'dataTables.tableTools.css',
        'responsive.bootstrap.min.css',
        '_all-skins.min.css',
        'AdminLTE.css',
        'blue.css',
        'datepicker3.css',
        'daterangepicker-bs3.css',
        'morris.css',
        'bootstrap.min.css',
        'select2.min.css',
        'select2-bootstrap.min.css',
        'style.css',
        'font-awesome.min.css',
        'ionicons.min.css',
        'loader.css'
    ],'public/css/all.css');

    mix.scripts([
        'bootstrap-datepicker.js',
        'bootstrap-filestyle.min.js',
        'data.js',
        'daterangepicker.js',
        'export-csv.js',
        'exporting.js',
        'fastclick.min.js',
        'highcharts.js',
        'highcharts-more.js',
        'jquery.inputmask.date.extensions.js',
        'jquery.inputmask.extensions.js',
        'jquery.inputmask.js',
        'jquery.knob.js',
        'jquery.slimscroll.min.js',
        'jquery.sparkline.min.js',
        'laravel-bootstrap-modal-form.js',
        'morris.min.js',
        'select2.min.js',
    ], 'public/js/all.js');


});
