'use strict';

const _ = require('lodash');
const config = require('config');
const Promise = require('bluebird');
const cheerio = require('cheerio');

const fs = Promise.promisifyAll(require('fs'));
const fileHelper = require('./lib/fileHelper');
const rp = require('./lib/request');


const preReqRegex = /Course or Test: (.+)\s+Minimum Grade of (.{2})\s+(.+)/;
const subjectRegex = /(.+) (\d{1,4}.+)/;

async function loadSubjects() {
  const subjectsStr = await fs.readFileAsync(config.get('subjectsFile'));
  return JSON.parse(subjectsStr);
}

async function getAllPrerequisites(catalog, subjects) {

}

async function getPrerequisite(crn, subjects) {
  const options = {
    method: 'POST',
    uri: config.get('catalog.urls.prereqs'),
    json: true,
    headers: {
      Referer: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/classSearch/classSearch',
    },
    form: {
      term: config.get('catalog.term'),
      courseReferenceNumber: crn,
    },
  };

  const prereqHtml = await rp(options);
  console.log(prereqHtml);

  const $ = cheerio.load(prereqHtml);
  let reqData = $('pre').toArray();
  reqData = reqData.slice(1, reqData.length - 1)
    .map(i => $(i).text());

  if((reqData.join('').match(/\nor\n/g) || []).length > 1) {
    console.error('Warning: CRN', crn, 'has more than one OR in prereqs.');
  }

  const firstIsAnd = (reqData[1] || '  and')
    .slice(2)
    .trim()
    .startsWith('and');

  const output = {
    and: [],
    or: [],
  };

  reqData.forEach((item) => {
    let req = item;
    let isAnd = true;

    req = req.slice(2).trim();
    if(req.startsWith('and')) {
      req = req.slice(5).trim();
    } else if(req.startsWith('or')) {
      isAnd = false;
      req = req.slice(6).trim();
    } else {
      isAnd = firstIsAnd;
    }

    const match = preReqRegex.exec(req);
    const subMatch = subjectRegex.exec(match[1]);
    const subCode = (_.find(subjects, sub => sub.description === subMatch[1])
                      || { code: 'UNKNOWN' }).code;
    const courseCode = subMatch[2];
    const prereq = {
      course: subCode + courseCode,
      minGrade: match[2],
      disallowConcurrent: match[3].includes('not'),
    };

    if(isAnd) {
      output.and.push(prereq);
    } else {
      output.or.push(prereq);
    }
  });

  return output;
}

async function main() {
  const subjects = await loadSubjects();
}

if(require.main === module) { // Was run directly
  main();
} else { // Required as module
  module.exports = {
    getPrerequisite,
    getAllPrerequisites,
  };
}
