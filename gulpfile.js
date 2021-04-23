const gulp = require('gulp');
const gulpFlattenJson = require('gulp-flatten-json');
const json2csv = require('gulp-json2csv');
const concat = require('gulp-concat');
const map    = require('map-stream');
const jsonTransform = require('gulp-json-transform');
const rename = require('gulp-rename');

var uniqueFilterFn = function(item, idx, all) {
  return idx === all.indexOf(item);
};

var onlyodd = function(item, idx, all) {
  return idx % 2 == 1;
};

function defaultTask(cb) {
  // place code for your default task here

  gulp.src('src/*/*.json')
    .pipe(gulpFlattenJson())

    //cherry-pick JSON attributes
    .pipe(jsonTransform(function(data, file) {
      return {
        file: file.relative,
        directory: file.relative.split('/')[0],
        requestedUrl: data.requestedUrl,
        finalUrl: data.finalUrl,
        "Performance": data["categories.performance.score"],
        "Accessibility": data["categories.accessibility.score"],
        "Best-practices": data["categories.best-practices.score"],
        "SEO": data["categories.seo.score"],
        "Metric - First Contentful Paint (ms)": data["audits.first-contentful-paint.numericValue"],
        "Metric - Largest Contentful Paint (ms)": data["audits.largest-contentful-paint.numericValue"],
        "Metric - Speed Index (ms)": data["audits.speed-index.numericValue"],
        "Metric - Time to Interactive (ms)": data["audits.interactive.numericValue"],
        "Metric - Cumulaive Layout Shift (unitless)": data["audits.cumulative-layout-shift.displayValue"],
        "Metric - Total Blocking Time (ms)": data["audits.total-blocking-time.numericValue"],
        "Score - First Contentful Paint (ms)": data["audits.first-contentful-paint.score"],
        "Score - Largest Contentful Paint (ms)": data["audits.largest-contentful-paint.score"],
        "Score - Speed Index (ms)": data["audits.speed-index.score"],
        "Score - Time to Interactive (ms)": data["audits.interactive.score"],
        "Score - Cumulaive Layout Shift (unitless)": data["audits.cumulative-layout-shift.score"],
        "Score - Total Blocking Time (ms)": data["audits.total-blocking-time.score"],
        "Input Latency (ms)": data["audits.estimated-input-latency.numericValue"],
        "First Meaningul Paint (ms)": data["audits.first-meaningful-paint.numericValue"],
        "CPU/Memory Power": data["environment.benchmarkIndex"],
        };
    }))
    .pipe(gulp.dest('out_flat'))
    .pipe(json2csv())
    .pipe(gulp.dest('out_flat_csv'))
    .pipe(concat('merge'))
    .pipe(map(function(file, cb) {

      // // convert file buffer into a string
      var contents = file.contents.toString();
    
      // // split it by lines
      var lines = contents.split(/[\r\n]/);

      console.log(lines.length + " lines found");
    
      // // apply the unique filter
      var evenLines = lines.filter(onlyodd);
    
      // // join unique list into lines
      var output = [lines[0]+'\n'];
      output += evenLines.join('\n');
    
      // // convert string back into buffer
      var buffer = Buffer.from(output, 'binary');
    
      // // replace the file contents
      file.contents = buffer;
    
      // // continue
      return cb(null, file);
    }))
    .pipe(rename('merged.csv'))
    .pipe(gulp.dest('out'))

  cb();
}

exports.default = defaultTask
