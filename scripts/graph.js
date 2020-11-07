'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const fileHelper = require('./lib/fileHelper');


function createNode(data, subjects) {
  return {
    nodeName: data.subjectCourse,
    fullName: data.courseTitle,
    group: _.findIndex(subjects, sub => sub.code === data.subject),
  };
}

function createEdge(locMap, source, data, type) {
  if(!(data.course in locMap)) {
    console.log('[!] Skipped edge:', source, '->', data.course);
    return null;
  }
  console.log('Created edge:', source, '->', data.course);
  return {
    source: locMap[source],
    target: locMap[data.course],
    type,
    allowConcurrent: !data.disallowConcurrent,
  };
}

function createGraph(catalog, subjects) {
  const locMap = {};
  const output = {
    nodes: [],
    edges: [],
  };
  _.forEach(catalog, (course, index) => {
    locMap[course.subjectCourse] = index;
  })

  _.forEach(catalog, (course, index) => {
    const node = createNode(course, subjects);
    node.index = index;
    output.nodes.push(node);
    locMap[course.subjectCourse] = index;
    if(!course.prereqs || !course.prereqs.and) return;

    output.edges = output.edges
      .concat(course.prereqs.and.map(req => createEdge(locMap, course.subjectCourse, req, 'and')))
      .concat(course.prereqs.or.map(req => createEdge(locMap, course.subjectCourse, req, 'or')));
  });

  console.log('Edges initially:', output.edges.length);
  output.edges = output.edges.filter(edge => edge);
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
