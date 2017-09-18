'use strict';

const g = {
  nodes: [],
  edges: [],
};

// Instantiate sigma:
const s = new sigma({
  graph: g,
  container: 'container',
});


function onData(catalog) {
  console.log(catalog);

  const edges = [];

  _.forEach(catalog, (course) => {
    s.graph.addNode({
      id: course.subjectCourse,
      label: course.subjectCourse, // `${course.subjectCourse}: ${course.courseTitle}`,
      x: Math.random(),
      y: Math.random(),
      size: 1,
      color: '#666',
    });
    if(!course.prereqs || !course.prereqs.and) return true;
    const prereqs = [];
    _.forEach(course.prereqs.and, (req) => {
      req.color = '#3633FF';
      prereqs.push(req);
    });
    _.forEach(course.prereqs.or, (req) => {
      req.color = '#FF0000';
      prereqs.push(req);
    });
    _.forEach(prereqs, (req, num) => {
      // console.log(req);
      edges.push({
        id: `${course.subjectCourse}-${num}`,
        source: course.subjectCourse,
        target: req.course,
        size: 1,
        color: req.color,
        type: 'arrow',
      });
    });
  });
  s.refresh();

  _.forEach(edges, (edge) => {
    if(_.some(catalog, c => c.subjectCourse === edge.target)) {
      console.log(edge);
      s.graph.addEdge(edge);
    }
  });

  console.log('Done:', g);
  var listener = sigma.layouts.dagre.start(s, {});
  s.refresh();
  // s.startForceAtlas2();
}

$.get({
  url: 'data/201740_all_prereqs.json',
  success: onData,
  dataType: 'json',
});
