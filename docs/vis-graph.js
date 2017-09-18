'use strict';

const nodes = new vis.DataSet([]);
const edges = new vis.DataSet([]);

const container = document.getElementById('container');
const data = {
  nodes,
  edges,
};
const options = {
  layout: {
    hierarchical: {
      direction: 'UD',
      sortMethod: 'directed',
      edgeMinimization: true,
    },
  },
  interaction: { dragNodes: true },
  physics: {
    enabled: false,
  },
  configure: {
    showButton: false,
  },
  edges: {
    smooth: true,
    arrows: { to: true },
  },
};
const network = new vis.Network(container, data, options);


function onData(catalog) {
  console.log(catalog);

  const localEdges = [];
  const localNodes = [];

  _.forEach(catalog, (course) => {
    localNodes.push({
      id: course.subjectCourse,
      label: course.subjectCourse, // `${course.subjectCourse}: ${course.courseTitle}`,
    });
    if(!course.prereqs || !course.prereqs.and) return true;
    const prereqs = [];
    _.forEach(course.prereqs.and, (req) => {
      // req.color = '#3633FF';
      prereqs.push(req);
    });
    _.forEach(course.prereqs.or, (req) => {
      // req.color = '#FF0000';
      req.dashes = true;
      prereqs.push(req);
    });
    _.forEach(prereqs, (req, num) => {
      // console.log(req);
      localEdges.push({
        id: `${course.subjectCourse}-${num}`,
        from: course.subjectCourse,
        to: req.course,
        dashes: req.dashes || false,
      });
    });
  });

  nodes.add(localNodes);
  edges.add(_.filter(localEdges, edge => _.some(catalog, c => c.subjectCourse === edge.to)));
}

$.get({
  url: 'data/201740_all_prereqs.json',
  success: onData,
  dataType: 'json',
});
