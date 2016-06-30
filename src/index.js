'use strict';

import './hidpi-canvas';

import Graph from './graph';
import Layouter from './layouter/sugiyama';
import { CycleRemoval } from './layouter/sugiyama/cycle-removal';
import transform from './transform';

export default class GView {
  constructor(domId, data, options) {
    options = options || {};
    this.width = options.width || 800;
    this.height = options.height || 400;
    this.color = options.color || '#555';
    this.bgColor = options.bgColor || '#fff';
    this.lineColor = options.lineColor || '#09f';
    this.fontSize = options.fontSize || 14;
    this.fontFamily = options.fontFamily || 'Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif';
    this.padX = options.padX || 10;
    this.padY = options.padY || 5;

    this.ltor = options.ltor || true;
    this.layerMargin = options.layerMargin || 20;
    this.vertexMargin = options.vertexMargin || this.ltor ? 5 : 30;
    this.edgeMargin = options.edgeMargin || 5;
    this.hited = options.hited || function() {};

    this.data = data;
    this.root = document.getElementById(domId);

    this.root.width = this.width;
    this.root.height = this.height;

    this.ctx = transform(this.root.getContext('2d'));

    this.buildGraph();
    this.buildLayout();
    this.bindEvents();
    this.moveToCenter();
  }

  reLayout(ltor, layerMargin, vertexMargin, edgeMargin) {
    this.ltor = ltor;
    this.layerMargin = layerMargin || this.layerMargin;
    this.vertexMargin = vertexMargin || this.vertexMargin;
    this.edgeMargin = edgeMargin || this.edgeMargin;
    this.buildLayout();
    this.moveToCenter();
  }

  buildGraph() {
    this.ctx.font = this.fontSize + 'px ' + this.fontFamily;

    let g = new Graph();
    for (let v of this.data.vertices) {
      g.addVertex(v.id, Object.assign({
        label: v.name,
        width: this.ctx.measureText(v.name).width + this.padX * 2,
        height: this.fontSize + this.padY * 2
      }, v));
    }
    for (let e of this.data.edges) {
      g.addEdge(e.from, e.to, Object.assign({
        weight: 1
      }, e));
    }
    new CycleRemoval().call(g);
    this.graph = g;
  }

  buildLayout() {
    let layouter = new Layouter()
      .ltor(this.ltor)
      .layerMargin(this.layerMargin)
      .vertexMargin(this.vertexMargin)
      .edgeMargin(this.edgeMargin)
      .vertexWidth((arg) => arg.d.width)
      .vertexHeight((arg) => arg.d.height);
    this.layout = layouter.layout(this.graph);
  }

  hitTest(x, y) {
    let datas = [];
    for (let id of this.graph.vertices()) {
      const data = this.graph.vertex(id);
      const s = this.layout.vertices[id];

      let x1 = s.x - s.width / 2;
      let y1 = s.y - s.height / 2;
      let x2 = x1 + s.width;
      let y2 = y1 + s.height;
      if (x > x1 && x < x2 && y > y1 && y < y2) {
        datas.push(data);
      }
    }
    return datas;
  }

  bindEvents() {
    const self = this;

    var lastX = self.width / 2;
    var lastY = self.height / 2;
    var dragStart;
    var dragged;

    self.root.addEventListener('mousedown', function(e) {
      document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
      lastX = e.offsetX || (e.pageX - self.root.offsetLeft);
      lastY = e.offsetY || (e.pageY - self.root.offsetTop);
      dragStart = self.ctx.transformedPoint(lastX, lastY);
      dragged = false;
    }, false);

    self.root.addEventListener('mousemove', function(e) {
      lastX = e.offsetX || (e.pageX - self.root.offsetLeft);
      lastY = e.offsetY || (e.pageY - self.root.offsetTop);
      dragged = true;
      if (dragStart) {
        let pt = self.ctx.transformedPoint(lastX, lastY);
        self.ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
        self.render();
      }
    }, false);

    self.root.addEventListener('mouseup', function(e) {
      dragStart = null;
      if (!dragged) {
        let x = e.offsetX || (e.pageX - self.root.offsetLeft);
        let y = e.offsetY || (e.pageY - self.root.offsetTop);
        let p = self.ctx.transformedPoint(x, y);
        self.hited(self.hitTest(p.x, p.y));
      }
    }, false);

    var scaleFactor = 1.1;
    function zoom(clicks) {
      let pt = self.ctx.transformedPoint(lastX, lastY);
      self.ctx.translate(pt.x, pt.y);
      let factor = Math.pow(scaleFactor, clicks);
      self.ctx.scale(factor, factor);
      self.ctx.translate(-pt.x, -pt.y);
      self.render();
    }

    function handleScroll(e) {
      var delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
      if (delta) zoom(delta);
      return e.preventDefault() && false;
    }
    self.root.addEventListener('DOMMouseScroll', handleScroll, false);
    self.root.addEventListener('mousewheel', handleScroll, false);
  }

  moveToCenter() {
    this.ctx.restore();
    let x = 0;
    let y = 0;
    let n = 0;
    for (let u of this.graph.vertices()) {
      x += this.layout.vertices[u].x;
      y += this.layout.vertices[u].y;
      n++;
    }
    if (n > 0) {
      let pt = this.ctx.transformedPoint(this.width / 2, this.height / 2);
      this.ctx.translate(pt.x - x / n, pt.y - y / n);
    }
    this.ctx.save();
    this.render();
  }

  render() {
    const ctx = this.ctx;

    // Clear the entire canvas
    let p1 = ctx.transformedPoint(0, 0);
    let p2 = ctx.transformedPoint(this.width, this.height);
    ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

    for (let id of this.graph.vertices()) {
      const data = this.graph.vertex(id);
      const s = this.layout.vertices[id];

      ctx.fillStyle = data.bgColor || this.bgColor;
      ctx.fillRect(s.x - s.width / 2, s.y - s.height / 2, s.width, s.height);

      ctx.fillStyle = data.color || this.color;
      ctx.textBaseline = 'middle';
      ctx.fillText(data.label, s.x - s.width / 2 + this.padX, s.y);
    }

    ctx.strokeStyle = this.lineColor;
    ctx.fillStyle = this.lineColor;

    for (let [u, v] of this.graph.edges()) {
      const p = this.layout.edges[u][v].points;

      function curveTo(p1, p2, ltor) {
        if (ltor) {
          let xc = (p2[0] - p1[0]) / 2;
          ctx.bezierCurveTo(p1[0] + xc, p1[1], p2[0] - xc, p2[1], p2[0], p2[1]);
        } else {
          let yc = (p2[1] - p1[1]) / 2;
          ctx.bezierCurveTo(p1[0], p1[1] + yc, p2[0], p2[1] - yc, p2[0], p2[1]);
        }
      }

      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      ctx.lineTo(p[1][0], p[1][1]);
      for (let i = 3; i < p.length; i += 2) {
        curveTo(p[i - 2], p[i - 1], this.ltor);
        ctx.lineTo(p[i][0], p[i][1]);
      }
      ctx.stroke();

      let last = p[p.length - 1];
      ctx.beginPath();
      ctx.arc(last[0], last[1], 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }
}
