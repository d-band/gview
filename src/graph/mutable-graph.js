const AbstractGraph = require('./abstract-graph')

const privates = new WeakMap()

const p = (self) => privates.get(self)

class MutableGraph extends AbstractGraph {
  constructor () {
    super()
    privates.set(this, {
      vertices: new Map(),
      numVertices: 0,
      numEdges: 0
    })
  }

  vertex (u) {
    const vertices = p(this).vertices
    if (vertices.get(u)) {
      return vertices.get(u).data
    }
    return null
  }

  edge (u, v) {
    const vertices = p(this).vertices
    if (vertices.get(u) && vertices.get(u).outVertices.get(v)) {
      return vertices.get(u).outVertices.get(v)
    }
    return null
  }

  vertices () {
    return Array.from(p(this).vertices.keys())
  }

  outVertices (u) {
    if (this.vertex(u) === null) {
      throw new Error(`Invalid vertex: ${u}`)
    }
    return Array.from(p(this).vertices.get(u).outVertices.keys())
  }

  inVertices (u) {
    if (this.vertex(u) === null) {
      throw new Error(`Invalid vertex: ${u}`)
    }
    return Array.from(p(this).vertices.get(u).inVertices.keys())
  }

  numVertices () {
    return p(this).numVertices
  }

  numEdges () {
    return p(this).numEdges
  }

  outDegree (u) {
    if (this.vertex(u) === null) {
      throw new Error(`Invalid vertex: ${u}`)
    }
    return p(this).vertices.get(u).outVertices.size
  }

  inDegree (u) {
    if (this.vertex(u) === null) {
      throw new Error(`Invalid vertex: ${u}`)
    }
    return p(this).vertices.get(u).inVertices.size
  }

  addVertex (u, obj = {}) {
    if (this.vertex(u)) {
      throw new Error(`Duplicated vertex: ${u}`)
    }
    p(this).vertices.set(u, {
      outVertices: new Map(),
      inVertices: new Map(),
      data: obj
    })
    p(this).numVertices++
    return this
  }

  addEdge (u, v, obj = {}) {
    if (this.vertex(u) === null) {
      throw new Error(`Invalid vertex: ${u}`)
    }
    if (this.vertex(v) === null) {
      throw new Error(`Invalid vertex: ${v}`)
    }
    if (this.edge(u, v)) {
      throw new Error(`Duplicated edge: (${u}, ${v})`)
    }
    p(this).numEdges++
    p(this).vertices.get(u).outVertices.set(v, obj)
    p(this).vertices.get(v).inVertices.set(u, obj)
    return this
  }

  removeVertex (u) {
    for (const v of this.outVertices(u)) {
      this.removeEdge(u, v)
    }
    for (const v of this.inVertices(u)) {
      this.removeEdge(v, u)
    }
    p(this).vertices.delete(u)
    p(this).numVertices--
    return this
  }

  removeEdge (u, v) {
    if (this.edge(u, v) === null) {
      throw Error(`Invalid edge: (${u}, ${v})`)
    }
    p(this).vertices.get(u).outVertices.delete(v)
    p(this).vertices.get(v).inVertices.delete(u)
    p(this).numEdges--
    return this
  }
}

module.exports = MutableGraph
