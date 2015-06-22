var metalsmith  = require('metalsmith'),
    markdown    = require('metalsmith-markdown'),
    templates   = require('metalsmith-templates'),
    sass        = require('metalsmith-sass'),
    bourbon     = require('node-bourbon'),
    collections = require('metalsmith-collections'),
    permalinks  = require('metalsmith-permalinks'),
    excerpts    = require('metalsmith-excerpts'),
    paginate    = require('metalsmith-paginate'),
    hljs        = require('highlight.js'),
    jade        = require('jade'),
    handlebars  = require('handlebars'),
    moment      = require('moment'),
    metadata    = require('./config')(process.argv),
    fs          = require('fs');


handlebars.registerPartial('header',  fs.readFileSync(__dirname + '/templates/header.hbt').toString());
handlebars.registerPartial('footer',  fs.readFileSync(__dirname + '/templates/footer.hbt').toString());
handlebars.registerPartial('code',    fs.readFileSync(__dirname + '/templates/code.hbt').toString());
handlebars.registerPartial('sidebar', fs.readFileSync(__dirname + '/templates/sidebar.hbt').toString());

handlebars.registerHelper('xmldate', function(date) {
    return moment(date).format('ddd, DD MMM YYYY HH:mm:ss ZZ');
});

handlebars.registerHelper('sitemapdate', function(date) {
    return moment(date).format('YYYY-MM-DD');
});

handlebars.registerHelper('date', function(date) {
    return moment(date).format('Do MMMM YYYY');
});

handlebars.registerHelper('link', function(path) {
    return metadata.baseUrl + '/' + path;
});


handlebars.registerHelper('limit', function(collection, limit, start) {
    var out   = [],
        i, c;

    start = start || 0;

    for (i = c = 0; i < collection.length; i++) {
        if (i >= start && c < limit+1) {
            out.push(collection[i]);
            c++;
        }
    }

    return out;
});


var robots = function(opts) {
  return function(files, metalsmith, done) {
    fs.readFile(opts.source, function(err, data) {
      files['robots.txt'] = {
        contents: data
      }
      done();
    })
  }
}


var siteBuild = metalsmith(__dirname)
    .metadata(metadata)
    //.source('./src')
    //.destination('./build')
    .use(collections({
       posts: {
           pattern: 'content/posts/*.md',
           sortBy: 'date',
           reverse: true
       },
       pages: {
           pattern: 'content/pages/*.md'
       },
       entries: {
           pattern: 'content/po*/*.md',
           sortBy: 'date',
           reverse: true
       },
    }))
    .use(paginate({
      perPage: 10,
      path: ':collection/page'
    }))
    .use(excerpts())
    .use(markdown({
        gfm: true,
        tables: true,
        breaks: true,
        smartLists: true,
        smartypants: true,
        highlight: function (code, lang, callback) {
            return hljs.highlightAuto(code).value
        }
    }))
    //.use(robots({
    //  source: 'sample-robots.txt'
    //}))
    .use(permalinks({
      pattern: ':collection/:title'
    }))
    .use(templates({
      //engine: 'jade',
      engine: 'handlebars',
      moment: moment
    }))
    .use(sass({
      includePaths: bourbon.includePaths,
      outputStyle: 'compressed'
    }))
    .build(function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('Site build complete!');
      }
    });
