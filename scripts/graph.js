'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const fileHelper = require('./lib/fileHelper');


function createNode(data, subjects) {
  return {
    id: data.subjectCourse,
    fullName: data.courseTitle,
    group: _.findIndex(subjects, sub => sub.code === data.subject),
  };
}

function createEdge(course, data, type) {
  console.log('Created edge:', course.subjectCourse, '->', data.course);
  return {
    source: course.subjectCourse,
    target: data.course,
    type,
    allowConcurrent: !data.disallowConcurrent,
  };
}

function createGraph(catalog, subjects) {
  const freqMap = {};
  const output = {
    nodes: [],
    edges: [],
  };

  _.forEach(catalog, (course) => {
    freqMap[course.subjectCourse] = true;
    output.nodes.push(createNode(course, subjects));
    if(!course.prereqs || !course.prereqs.and) return;

    output.edges = output.edges
      .concat(course.prereqs.and.map(req => createEdge(course, req, 'and')))
      .concat(course.prereqs.or.map(req => createEdge(course, req, 'or')));
  });

  console.log('Edges initially:', output.edges.length);
  output.edges = output.edges.filter(edge => edge.target in freqMap);
  console.log('Edges after filtering:', output.edges.length);
  return output;
}

async function main() {
  const [catalog, subjects] = await Promise.all([
    fileHelper.loadPrereqCatalog(),
    fileHelper.loadSubjects(),
  ]);

  const graphData = JSON.stringify(createGraph(catalog, subjects), null, 2);
  await fs.writeFileAsync(fileHelper.getGraphPath(), graphData);
}

if(require.main === module) { // Was run directly
  main();
} else { // Required as module
  module.exports = createGraph;
}
