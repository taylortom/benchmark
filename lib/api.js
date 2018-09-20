const benchmark = require('benchmark');
const fs = require('fs-extra');
const path = require('path');

const api = {
  getTests(req, res, next) {
    fs.readdir('tests', (error, contents) => {
      if(error) {
        return res.send(error.message);
      }
      const filtered = contents.filter(item =>  item[0] !== '.' && path.extname(item) === '.js');
      res.send(filtered);
    });
  },

  runTest(req, res, next) {
    const test = req.query.test;
    console.log(`Running test '${test}'`);
    try {
      const tests = require(path.join(process.cwd(), 'tests', test));
      const suite = new benchmark.Suite;
      // add exported tests
      Object.keys(tests).forEach(testName => suite.add(testName, tests[testName]));
      suite
        .on('cycle', event => console.log(`Done test '${test}': ${String(event.target)}`))
        .on('complete', event => {
          const sorted = suite.sort((a, b) => a.hz > b.hz ? -1 : a.hz < b.hz);
          res.send(sorted.map(item => `${item.name}: ${Math.round(item.hz)} iterations`));
        })
        .run({ async: true, maxTime: 1 });
    } catch(e) {
      next(e);
    }
  },

  errorHandler: (error, req, res, next) => {
    console.log(error);
    res.status(500).send(error.message);
  }
};

module.exports = api;
