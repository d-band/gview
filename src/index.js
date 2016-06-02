'use strict';

import Graph from 'egraph/graph';
import Layouter from 'egraph/layouter/sugiyama';
import 'egraph/utils/accessor';
import './hidpi-canvas';

const rootDom = document.getElementById('root');
const ctx = rootDom.getContext('2d');

ctx.font = '14px serif';

function buildGraph(data) {
  let g = new Graph();
  for (let v of data.vertices) {
    let size = ctx.measureText(v.name);
    g.addVertex(v.id, {
      label: v.name,
      width: size.width,
      height: 20
    });
  }
  for (let e of data.edges) {
    g.addEdge(e.from, e.to, {
      weight: 1
    });
  }
  return g;
}

function buildLayout(g) {
  let layouter = new Layouter()
    .vertexWidth((arg) => arg.d.width)
    .vertexHeight((arg) => arg.d.height);
  return layouter.layout(g);
}

let g = buildGraph({
  vertices: [{
    id: 1,
    name: 'node-1'
  }, {
    id: 2,
    name: 'node-2'
  }, {
    id: 3,
    name: 'node-3'
  }, {
    id: 4,
    name: 'node-4'
  }, {
    id: 5,
    name: 'node-5'
  }, {
    id: 6,
    name: 'node-6'
  }, {
    id: 7,
    name: 'node-7'
  }, {
    id: 8,
    name: 'node-8'
  }],
  edges: [{
    from: 1,
    to: 2
  }, {
    from: 1,
    to: 3
  }, {
    from: 2,
    to: 4
  }, {
    from: 2,
    to: 7
  }, {
    from: 3,
    to: 4
  }, {
    from: 4,
    to: 6
  }, {
    from: 4,
    to: 8
  }, {
    from: 3,
    to: 5
  }, {
    from: 5,
    to: 6
  }]
});

let layout = buildLayout(g);

console.log(layout);

for (const u of g.vertices()) {
  const d = g.vertex(u);
  const s = layout.vertices[u];
  ctx.fillText(d.label, s.x, s.y);
}
for (const [u, v] of g.edges()) {
  let p = layout.edges[u][v].points;
  ctx.beginPath();
  ctx.moveTo(p[0][0]+20, p[0][1]-3);
  for (var i = 1; i < p.length; i++) {
    ctx.lineTo(p[i][0]+20, p[i][1]-3);
  }
  ctx.stroke();
}

export default g;