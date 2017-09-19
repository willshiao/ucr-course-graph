'use strict';

const config = require('config');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const assert = require('assert');

const fileHelper = require('./lib/fileHelper');
const authHandler = require('./lib/authHandler');
const rp = require('./lib/request');


async function getCatalog(j) {
  const jar = j || await authHandler.getJar();

  const options = {
    uri: config.get('catalog.urls.search'),
    qs: {
      txt_term: config.get('catalog.term'),
      txt_subject: config.get('catalog.subjects'),
      pageOffset: 0,
      pageMaxSize: 1,
    },
    jar,
    json: true,
  };

  // First, get the total number of courses
  let res = await rp(options);
  const numCourses = res.totalCount;
  console.log('Courses:', numCourses);
  assert.notEqual(numCourses, 0);

  // Next, fetch all courses
  let fetchedCourses = [];
  const requestQueue = [];
  options.qs.pageMaxSize = 500;

  for(let pageOffset = 0; pageOffset <= numCourses; pageOffset += 500) {
    requestQueue.push((async () => {
      const settings = options;
      settings.qs.pageOffset = pageOffset;
      res = await rp(settings);
      console.log('Fetched', res.data.length, 'courses');
      fetchedCourses = fetchedCourses.concat(res.data);
    })());
  }
  await Promise.all(requestQueue);
  console.log('Fetched a total of', fetchedCourses.length, 'courses');

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
  const filename = fileHelper.getCatalogPath();
  const catalog = await getCatalog();

  await fs.writeFileAsync(filename, JSON.stringify(catalog, null, 2));
}


if(require.main === module) { // Was run directly
  main();
} else { // Required as module
  module.exports = getCatalog;
}
