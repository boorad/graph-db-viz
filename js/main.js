
(function(G) {

    var width = 960,
        height = 500,
        r = 20;

    var force = d3.layout.force()
        .gravity(.05)
        .charge(-200)
        .linkDistance(100)
        .size([width, height])

    var svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height);

    var edge = svg.selectAll(".edge");
    var vertex = svg.selectAll(".vertex")

    // private
    _vertices = force.nodes();
    _edges = force.links();

    _update = function() {

        edge = edge.data(_edges);
        edge.enter().insert("line", ".vertex")
            .attr("class", "edge");
        edge.exit().remove();

        vertex = vertex.data(_vertices);
        vertex.enter().append("circle")
            .attr("class", function(d) {return "vertex " + d.type; })
            .attr("r", r)
            .call(force.drag);
        vertex.exit().remove();

        vertex.append("title")
            .text(function(d) { return d.name; });

        force.on("tick", _tick);

        force.start();
    };

    _tick = function() {
        edge.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        vertex.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });

    };

    // public
    window.graph = {};

    graph.addVertex = function(V) {
        _vertices.push(V);
        _update();
    };

    graph.addEdge = function(E) {
        _edges.push(E);
        _update();
    };

    graph.countV = function() {
        return _vertices.length;
    };

    graph.countE = function() {
        return _edges.length;
    };

    graph.V = function() {
        return _vertices;
    }

    graph.E = function() {
        return _edges;
    }

}).call(this);

var b = 0;
var builds = [];

function build() {
    // check to see if we are done building
    if( b >= builds.length ) return;

    // add vertex or edge
    var j = builds[b];
    if( j.t == "v" )
        graph.addVertex(j);
    if( j.t == "e" )
        graph.addEdge(j);

    // increment build number
    b++;
    if( b > builds.length ) b = builds.length;
}

function bind_keys() {
    keypress.combo("right", function() {
        build();
    });
    keypress.combo("space", function() {
        build_all();
    });
}

function populate_builds() {
    d3.json("data/graph.json", function(error, json) {
        builds = json.builds;
    });
}

function build_all() {
    for( var i=0; i < builds.length; i++ ) {
        build();
    }
}

// init
populate_builds()
bind_keys();
