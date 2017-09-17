'use strict';

const _ = require('lodash');
const config = require('config');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const authHandler = require('./lib/authHandler');
const rp = require('./lib/request');


async function getCatalog(j) {
  const jar = j || await authHandler.getJar();

  const options = {
    uri: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/searchResults/searchResults',
    qs: {
      txt_term: config.get('catalog.term'),
      txt_subject: config.get('catalog.subjects'),
      pageOffset: 1,
      pageMaxSize: 1,
    },
    jar,
    json: true,
  };

  // First, get the total number of courses
  let res = await rp(options);
  const numCourses = res.totalCount;
  console.log('Courses:', numCourses);

  // Next, fetch all courses
  options.qs.pageMaxSize = numCourses;
  res = await rp(options);
  const fetchedCourses = res.data;

  // Next, get one of each lecture
  const courses = {};
  fetchedCourses.forEach((course) => {
    if(course.scheduleTypeDescription !== 'Lecture') return;
    if(!(course.subjectCourse in courses)) {
      courses[course.subjectCourse] = course;
      delete courses[course.subjectCourse].meetingsFaculty; // Delete for privacy reasons
    }
  });

  return courses;
}

async function main() {
  const subjects = config.get('catalog.subjects').split(',').join('-');
  const filename = `${config.get('catalog.term')}_${subjects}_catalog.json`;
  const savePath = path.join(config.get('dataDir'), filename);
  const catalog = await getCatalog();

  await fs.writeFileAsync(savePath, JSON.stringify(catalog, null, 2));
}


if(require.main === module) { // Was run directly
  main();
} else { // Required as module
  module.exports = getCatalog;
}
