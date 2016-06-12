'use strict';

import 'babel-polyfill';

import Graph from 'egraph/graph';
import Layouter from 'egraph/layouter/sugiyama';

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
    to: 7
  }, {
    from: 4,
    to: 6
  }, {
    from: 4,
    to: 8
  }, {
    from: 5,
    to: 6
  }]
});

let layout = buildLayout(g);

console.log(layout);

var lastX = rootDom.width / 2;
var lastY = rootDom.height / 2;

function trackTransforms(ctx) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  var xform = svg.createSVGMatrix();
  ctx.getTransform = function() {
    return xform;
  };

  var savedTransforms = [];
  var save = ctx.save;
  ctx.save = function() {
    savedTransforms.push(xform.translate(0, 0));
    return save.call(ctx);
  };
  var restore = ctx.restore;
  ctx.restore = function() {
    xform = savedTransforms.pop();
    return restore.call(ctx);
  };

  var scale = ctx.scale;
  ctx.scale = function(sx, sy) {
    xform = xform.scaleNonUniform(sx, sy);
    return scale.call(ctx, sx, sy);
  };
  var rotate = ctx.rotate;
  ctx.rotate = function(radians) {
    xform = xform.rotate(radians * 180 / Math.PI);
    return rotate.call(ctx, radians);
  };
  var translate = ctx.translate;
  ctx.translate = function(dx, dy) {
    xform = xform.translate(dx, dy);
    return translate.call(ctx, dx, dy);
  };
  var transform = ctx.transform;
  ctx.transform = function(a, b, c, d, e, f) {
    var m2 = svg.createSVGMatrix();
    m2.a = a;
    m2.b = b;
    m2.c = c;
    m2.d = d;
    m2.e = e;
    m2.f = f;
    xform = xform.multiply(m2);
    return transform.call(ctx, a, b, c, d, e, f);
  };
  var setTransform = ctx.setTransform;
  ctx.setTransform = function(a, b, c, d, e, f) {
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx, a, b, c, d, e, f);
  };
  var pt = svg.createSVGPoint();
  ctx.transformedPoint = function(x, y) {
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(xform.inverse());
  }
}

function redraw() {
  // Clear the entire canvas
  var p1 = ctx.transformedPoint(0, 0);
  var p2 = ctx.transformedPoint(rootDom.width, rootDom.height);
  ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
  for (const u of g.vertices()) {
    const d = g.vertex(u);
    const s = layout.vertices[u];
    ctx.fillText(d.label, s.x - s.width / 2, s.y - s.height / 2);
    ctx.fillRect(s.x - s.width / 2, s.y - s.height / 2, s.width, s.height);
  }
  for (const [u, v] of g.edges()) {
    let p = layout.edges[u][v].points;
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (var i = 1; i < p.length; i++) {
      ctx.lineTo(p[i][0], p[i][1]);
    }
    ctx.stroke();
  }
}

trackTransforms(ctx);
redraw();

var dragStart, dragged;
rootDom.addEventListener('mousedown', function(evt) {
  document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
  lastX = evt.offsetX || (evt.pageX - rootDom.offsetLeft);
  lastY = evt.offsetY || (evt.pageY - rootDom.offsetTop);
  dragStart = ctx.transformedPoint(lastX, lastY);
  dragged = false;
}, false);
rootDom.addEventListener('mousemove', function(evt) {
  lastX = evt.offsetX || (evt.pageX - rootDom.offsetLeft);
  lastY = evt.offsetY || (evt.pageY - rootDom.offsetTop);
  dragged = true;
  if (dragStart) {
    var pt = ctx.transformedPoint(lastX, lastY);
    ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
    redraw();
  }
}, false);
rootDom.addEventListener('mouseup', function(evt) {
  dragStart = null;
  if (!dragged) zoom(evt.shiftKey ? -1 : 1);
}, false);

var scaleFactor = 1.1;
var zoom = function(clicks) {
  var pt = ctx.transformedPoint(lastX, lastY);
  ctx.translate(pt.x, pt.y);
  var factor = Math.pow(scaleFactor, clicks);
  ctx.scale(factor, factor);
  ctx.translate(-pt.x, -pt.y);
  redraw();
}

var handleScroll = function(evt) {
  var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
  if (delta) zoom(delta);
  return evt.preventDefault() && false;
};
rootDom.addEventListener('DOMMouseScroll', handleScroll, false);
rootDom.addEventListener('mousewheel', handleScroll, false);

export default g;