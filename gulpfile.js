const gulp = require('gulp');
const gulpFlattenJson = require('gulp-flatten-json');
const json2csv = require('gulp-json2csv');
const concat = require('gulp-concat');
const map    = require('map-stream');
const jsonTransform = require('gulp-json-transform');
const rename = require('gulp-rename');
// const mergeStream =   require('merge-stream');
const eventStream = require('event-stream');

var uniqueFilterFn = function(item, idx, all) {
  return idx === all.indexOf(item);
};

var linesContainingUrlAttribute = function(item, idx, all) {
  return item.indexOf('.url":"http')>1;
};

var onlyodd = function(item, idx, all) {
  return idx % 2 == 1;
};

function issuesTask(cb) {

  let table_of_issues = [];

  var mainStream = gulp.src('src/*/*.json')
    .pipe(gulpFlattenJson())
    .pipe(gulp.dest('out_flat_json'));
    
    var streamOne = mainStream
    .pipe(map(function(file, cb) {

      // // convert file buffer into a string
      var contents = file.contents.toString();
    
      // // split it by lines
      var lines = contents.split(/,\"/);

      console.log(lines.length + " lines found on " +  file.relative.split('/')[1].replace('.json', ''));
    
      // // apply the unique filter
      var filteredLines = lines.filter(linesContainingUrlAttribute);
    
      // // join unique list into lines
      var output = '';
      if(filteredLines.length>1){
        output = '{"' + filteredLines.join(',\n"') + '}';
      } else {
        output = '{}';
      }
    
      // // convert string back into buffer
      var buffer = Buffer.from(output, 'binary');
    
      // // replace the file contents
      file.contents = buffer;
    
      // // continue
      return cb(null, file);
    }))
    // .pipe(gulp.dest('out_flat_json_problem_urls'))
    .pipe(jsonTransform(function(data, file) {
    
      let problemTypeValue;
      let oldObject;


      for (const [urlAttributeLine, urlValue] of Object.entries(data)){

        //Cleaning up type of error in order to count them later, removing numbers in brakets, removing HEX values, removing words with numbers as suffix, and removing any number surounded by periods
        problemTypeValue = urlAttributeLine.replace(/\[[0-9]+\]/g, '').replace(/\.[0-9A-F]+\./g, '.').replace(/\.[a-f]+[0-9]+\./g, '').replace(/\.[0-9]+\./g, '.');

        oldObject = table_of_issues.find(({ resourceURL, problemType }) => (resourceURL === urlValue && problemType === problemTypeValue));

        if(oldObject){
          oldObject.count++;
        } else {

          table_of_issues.push({
            resourceURL: urlValue,
            problemType: problemTypeValue,
            count: 1,
            file: file.relative.split('/')[1].replace('.json', ''),
            directory: file.relative.split('/')[0],
          });

        }

      }
      return table_of_issues;
    }))

    .on("finish", function () {
      console.log("We're done with filling the array !");
      streamOne.pipe(json2csv()).pipe(gulp.dest('out_issue'))
    })

    .pipe(gulp.dest('out_issues'))

  cb();
}

function defaultTask(cb) {
  // place code for your default task here

  gulp.src('src/*/*.json')
    .pipe(gulpFlattenJson())

    //cherry-pick JSON attributes
    .pipe(jsonTransform(function(data, file) {
      return {
        file: file.relative.split('/')[1].replace('.json', ''),
        directory: file.relative.split('/')[0],
        requestedUrl: data.requestedUrl,
        finalUrl: data.finalUrl,
        "Performance": data["categories.performance.score"],
        "Accessibility": data["categories.accessibility.score"],
        "Best-practices": data["categories.best-practices.score"],
        "SEO": data["categories.seo.score"],
        "Performance Main Score - Largest Contentful Paint": data["audits.largest-contentful-paint.score"],
        "Performance Main Score - Cumulaive Layout Shift (unitless)": data["audits.cumulative-layout-shift.score"],
        "Performance Main Score - Total Blocking Time": data["audits.total-blocking-time.score"],
        "Performance Score - Speed Index": data["audits.speed-index.score"],
        "Performance Score - Time to Interactive": data["audits.interactive.score"],
        "Performance Score - First Contentful Paint": data["audits.first-contentful-paint.score"],
        "First Contentful Paint (ms)": data["audits.first-contentful-paint.numericValue"],
        "Largest Contentful Paint (ms)": data["audits.largest-contentful-paint.numericValue"],
        "Speed Index (ms)": data["audits.speed-index.numericValue"],
        "Time to Interactive (ms)": data["audits.interactive.numericValue"],
        "Cumulaive Layout Shift (unitless)": data["audits.cumulative-layout-shift.displayValue"],
        "Total Blocking Time (ms)": data["audits.total-blocking-time.numericValue"],
        "Input Latency (ms)": data["audits.estimated-input-latency.numericValue"],
        "First Meaningul Paint (ms)": data["audits.first-meaningful-paint.numericValue"],
        "CPU/Memory Power": data["environment.benchmarkIndex"],

        "audits.is-on-https.score":data["audits.is-on-https.score"],
        "audits.redirects-http.score":data["audits.redirects-http.score"],
        "audits.service-worker.score":data["audits.service-worker.score"],
        "audits.viewport.score":data["audits.viewport.score"],
        "audits.first-contentful-paint.score":data["audits.first-contentful-paint.score"],
        "audits.largest-contentful-paint.score":data["audits.largest-contentful-paint.score"],
        "audits.first-meaningful-paint.score":data["audits.first-meaningful-paint.score"],
        "audits.speed-index.score":data["audits.speed-index.score"],
        "audits.screenshot-thumbnails.score":data["audits.screenshot-thumbnails.score"],
        "audits.final-screenshot.score":data["audits.final-screenshot.score"],
        "audits.estimated-input-latency.score":data["audits.estimated-input-latency.score"],
        "audits.total-blocking-time.score":data["audits.total-blocking-time.score"],
        "audits.max-potential-fid.score":data["audits.max-potential-fid.score"],
        "audits.cumulative-layout-shift.score":data["audits.cumulative-layout-shift.score"],
        "audits.errors-in-console.score":data["audits.errors-in-console.score"],
        "audits.server-response-time.score":data["audits.server-response-time.score"],
        "audits.first-cpu-idle.score":data["audits.first-cpu-idle.score"],
        "audits.interactive.score":data["audits.interactive.score"],
        "audits.user-timings.score":data["audits.user-timings.score"],
        "audits.critical-request-chains.score":data["audits.critical-request-chains.score"],
        "audits.redirects.score":data["audits.redirects.score"],
        "audits.installable-manifest.score":data["audits.installable-manifest.score"],
        "audits.apple-touch-icon.score":data["audits.apple-touch-icon.score"],
        "audits.splash-screen.score":data["audits.splash-screen.score"],
        "audits.themed-omnibox.score":data["audits.themed-omnibox.score"],
        "audits.maskable-icon.score":data["audits.maskable-icon.score"],
        "audits.content-width.score":data["audits.content-width.score"],
        "audits.image-aspect-ratio.score":data["audits.image-aspect-ratio.score"],
        "audits.image-size-responsive.score":data["audits.image-size-responsive.score"],
        "audits.preload-fonts.score":data["audits.preload-fonts.score"],
        "audits.deprecations.score":data["audits.deprecations.score"],
        "audits.mainthread-work-breakdown.score":data["audits.mainthread-work-breakdown.score"],
        "audits.bootup-time.score":data["audits.bootup-time.score"],
        "audits.uses-rel-preload.score":data["audits.uses-rel-preload.score"],
        "audits.uses-rel-preconnect.score":data["audits.uses-rel-preconnect.score"],
        "audits.font-display.score":data["audits.font-display.score"],
        "audits.diagnostics.score":data["audits.diagnostics.score"],
        "audits.network-requests.score":data["audits.network-requests.score"],
        "audits.network-rtt.score":data["audits.network-rtt.score"],
        "audits.network-server-latency.score":data["audits.network-server-latency.score"],
        "audits.main-thread-tasks.score":data["audits.main-thread-tasks.score"],
        "audits.metrics.score":data["audits.metrics.score"],
        "audits.performance-budget.score":data["audits.performance-budget.score"],
        "audits.timing-budget.score":data["audits.timing-budget.score"],
        "audits.resource-summary.score":data["audits.resource-summary.score"],
        "audits.third-party-summary.score":data["audits.third-party-summary.score"],
        "audits.third-party-facades.score":data["audits.third-party-facades.score"],
        "audits.largest-contentful-paint-element.score":data["audits.largest-contentful-paint-element.score"],
        "audits.layout-shift-elements.score":data["audits.layout-shift-elements.score"],
        "audits.layout-shift-elements.details.items[0].score":data["audits.layout-shift-elements.details.items[0].score"],
        "audits.layout-shift-elements.details.items[1].score":data["audits.layout-shift-elements.details.items[1].score"],
        "audits.layout-shift-elements.details.items[2].score":data["audits.layout-shift-elements.details.items[2].score"],
        "audits.layout-shift-elements.details.items[3].score":data["audits.layout-shift-elements.details.items[3].score"],
        "audits.layout-shift-elements.details.items[4].score":data["audits.layout-shift-elements.details.items[4].score"],
        "audits.long-tasks.score":data["audits.long-tasks.score"],
        "audits.no-unload-listeners.score":data["audits.no-unload-listeners.score"],
        "audits.non-composited-animations.score":data["audits.non-composited-animations.score"],
        "audits.unsized-images.score":data["audits.unsized-images.score"],
        "audits.valid-source-maps.score":data["audits.valid-source-maps.score"],
        "audits.preload-lcp-image.score":data["audits.preload-lcp-image.score"],
        "audits.full-page-screenshot.score":data["audits.full-page-screenshot.score"],
        "audits.pwa-cross-browser.score":data["audits.pwa-cross-browser.score"],
        "audits.pwa-page-transitions.score":data["audits.pwa-page-transitions.score"],
        "audits.pwa-each-page-has-url.score":data["audits.pwa-each-page-has-url.score"],
        "audits.accesskeys.score":data["audits.accesskeys.score"],
        "audits.aria-allowed-attr.score":data["audits.aria-allowed-attr.score"],
        "audits.aria-command-name.score":data["audits.aria-command-name.score"],
        "audits.aria-hidden-body.score":data["audits.aria-hidden-body.score"],
        "audits.aria-hidden-focus.score":data["audits.aria-hidden-focus.score"],
        "audits.aria-input-field-name.score":data["audits.aria-input-field-name.score"],
        "audits.aria-meter-name.score":data["audits.aria-meter-name.score"],
        "audits.aria-progressbar-name.score":data["audits.aria-progressbar-name.score"],
        "audits.aria-required-attr.score":data["audits.aria-required-attr.score"],
        "audits.aria-required-children.score":data["audits.aria-required-children.score"],
        "audits.aria-required-parent.score":data["audits.aria-required-parent.score"],
        "audits.aria-roles.score":data["audits.aria-roles.score"],
        "audits.aria-toggle-field-name.score":data["audits.aria-toggle-field-name.score"],
        "audits.aria-tooltip-name.score":data["audits.aria-tooltip-name.score"],
        "audits.aria-treeitem-name.score":data["audits.aria-treeitem-name.score"],
        "audits.aria-valid-attr-value.score":data["audits.aria-valid-attr-value.score"],
        "audits.aria-valid-attr.score":data["audits.aria-valid-attr.score"],
        "audits.button-name.score":data["audits.button-name.score"],
        "audits.bypass.score":data["audits.bypass.score"],
        "audits.color-contrast.score":data["audits.color-contrast.score"],
        "audits.definition-list.score":data["audits.definition-list.score"],
        "audits.dlitem.score":data["audits.dlitem.score"],
        "audits.document-title.score":data["audits.document-title.score"],
        "audits.duplicate-id-active.score":data["audits.duplicate-id-active.score"],
        "audits.duplicate-id-aria.score":data["audits.duplicate-id-aria.score"],
        "audits.form-field-multiple-labels.score":data["audits.form-field-multiple-labels.score"],
        "audits.frame-title.score":data["audits.frame-title.score"],
        "audits.heading-order.score":data["audits.heading-order.score"],
        "audits.html-has-lang.score":data["audits.html-has-lang.score"],
        "audits.html-lang-valid.score":data["audits.html-lang-valid.score"],
        "audits.image-alt.score":data["audits.image-alt.score"],
        "audits.input-image-alt.score":data["audits.input-image-alt.score"],
        "audits.label.score":data["audits.label.score"],
        "audits.link-name.score":data["audits.link-name.score"],
        "audits.list.score":data["audits.list.score"],
        "audits.listitem.score":data["audits.listitem.score"],
        "audits.meta-refresh.score":data["audits.meta-refresh.score"],
        "audits.meta-viewport.score":data["audits.meta-viewport.score"],
        "audits.object-alt.score":data["audits.object-alt.score"],
        "audits.tabindex.score":data["audits.tabindex.score"],
        "audits.td-headers-attr.score":data["audits.td-headers-attr.score"],
        "audits.th-has-data-cells.score":data["audits.th-has-data-cells.score"],
        "audits.valid-lang.score":data["audits.valid-lang.score"],
        "audits.video-caption.score":data["audits.video-caption.score"],
        "audits.custom-controls-labels.score":data["audits.custom-controls-labels.score"],
        "audits.custom-controls-roles.score":data["audits.custom-controls-roles.score"],
        "audits.focus-traps.score":data["audits.focus-traps.score"],
        "audits.focusable-controls.score":data["audits.focusable-controls.score"],
        "audits.interactive-element-affordance.score":data["audits.interactive-element-affordance.score"],
        "audits.logical-tab-order.score":data["audits.logical-tab-order.score"],
        "audits.managed-focus.score":data["audits.managed-focus.score"],
        "audits.offscreen-content-hidden.score":data["audits.offscreen-content-hidden.score"],
        "audits.use-landmarks.score":data["audits.use-landmarks.score"],
        "audits.visual-order-follows-dom.score":data["audits.visual-order-follows-dom.score"],
        "audits.uses-long-cache-ttl.score":data["audits.uses-long-cache-ttl.score"],
        "audits.total-byte-weight.score":data["audits.total-byte-weight.score"],
        "audits.offscreen-images.score":data["audits.offscreen-images.score"],
        "audits.render-blocking-resources.score":data["audits.render-blocking-resources.score"],
        "audits.unminified-css.score":data["audits.unminified-css.score"],
        "audits.unminified-javascript.score":data["audits.unminified-javascript.score"],
        "audits.unused-css-rules.score":data["audits.unused-css-rules.score"],
        "audits.unused-javascript.score":data["audits.unused-javascript.score"],
        "audits.uses-webp-images.score":data["audits.uses-webp-images.score"],
        "audits.uses-optimized-images.score":data["audits.uses-optimized-images.score"],
        "audits.uses-text-compression.score":data["audits.uses-text-compression.score"],
        "audits.uses-responsive-images.score":data["audits.uses-responsive-images.score"],
        "audits.efficient-animated-content.score":data["audits.efficient-animated-content.score"],
        "audits.duplicated-javascript.score":data["audits.duplicated-javascript.score"],
        "audits.legacy-javascript.score":data["audits.legacy-javascript.score"],
        "audits.appcache-manifest.score":data["audits.appcache-manifest.score"],
        "audits.doctype.score":data["audits.doctype.score"],
        "audits.charset.score":data["audits.charset.score"],
        "audits.dom-size.score":data["audits.dom-size.score"],
        "audits.external-anchors-use-rel-noopener.score":data["audits.external-anchors-use-rel-noopener.score"],
        "audits.geolocation-on-start.score":data["audits.geolocation-on-start.score"],
        "audits.inspector-issues.score":data["audits.inspector-issues.score"],
        "audits.no-document-write.score":data["audits.no-document-write.score"],
        "audits.no-vulnerable-libraries.score":data["audits.no-vulnerable-libraries.score"],
        "audits.js-libraries.score":data["audits.js-libraries.score"],
        "audits.notification-on-start.score":data["audits.notification-on-start.score"],
        "audits.password-inputs-can-be-pasted-into.score":data["audits.password-inputs-can-be-pasted-into.score"],
        "audits.uses-http2.score":data["audits.uses-http2.score"],
        "audits.uses-passive-event-listeners.score":data["audits.uses-passive-event-listeners.score"],
        "audits.meta-description.score":data["audits.meta-description.score"],
        "audits.http-status-code.score":data["audits.http-status-code.score"],
        "audits.font-size.score":data["audits.font-size.score"],
        "audits.link-text.score":data["audits.link-text.score"],
        "audits.crawlable-anchors.score":data["audits.crawlable-anchors.score"],
        "audits.is-crawlable.score":data["audits.is-crawlable.score"],
        "audits.robots-txt.score":data["audits.robots-txt.score"],
        "audits.tap-targets.score":data["audits.tap-targets.score"],
        "audits.hreflang.score":data["audits.hreflang.score"],
        "audits.plugins.score":data["audits.plugins.score"],
        "audits.canonical.score":data["audits.canonical.score"],
        "audits.structured-data.score":data["audits.structured-data.score"],
        "categories.performance.score":data["categories.performance.score"],
        "categories.accessibility.score":data["categories.accessibility.score"],
        "categories.best-practices.score":data["categories.best-practices.score"],
        "categories.seo.score":data["categories.seo.score"],
        "categories.pwa.score":data["categories.pwa.score"],
        };
    }))
    // .pipe(gulp.dest('out_flat'))
    .pipe(json2csv())
    // .pipe(gulp.dest('out_flat_csv'))
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
exports.issues = issuesTask
