'use strict';

function onData(data) {
  const arr = [];

  // Nasty hack to get rid of nodes with no links
  data.edges.forEach((edge) => {
    arr[edge.source] = 1;
    arr[edge.target] = 1;
    edge.sourceNode = data.nodes[edge.source];
    edge.targetNode = data.nodes[edge.target];
    delete edge.source;
    delete edge.target;
  });

  // Make nodes with no links null
  for(let i = 0; i < arr.length; ++i) {
    if(arr[i] === undefined) {
      data.nodes[i] = null;
    }
  }
  // Get rid of nulls (nodes with no links)
  data.nodes = data.nodes.filter(node => node);

  const vis = new pv.Panel()
    .width(3000)
    .height(1500)
    .bottom(90);

  const arc = vis.add(pv.Layout.Arc)
    .nodes(data.nodes)
    .links(data.edges.map((item) => { item.value = 1; return item; }))
    .sort((a, b) => {
      if(a.group === b.group) return b.linkDegree - a.linkDegree;
      return b.group - a.group;
    });

  arc.link.add(pv.Line)
    .strokeStyle((n, l) => {
      console.log(n, l);
      if(l.type === 'or') return 'rgba(204, 0, 3, 0.3)';
      return 'rgba(0, 0, 200, 0.3)';
    });

  arc.node.add(pv.Dot)
    .size(d => d.linkDegree + 5)
    .fillStyle(pv.Colors.category19().by(d => d.group))
    .strokeStyle(function makeDarker() {
      return this.fillStyle().darker();
    });

  arc.label.add(pv.Label);

  vis.render();
}

$.get({
  url: 'data/201740_all_graph.json',
  success: onData,
  dataType: 'json',
});
