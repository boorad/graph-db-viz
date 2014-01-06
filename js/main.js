
(function(G) {

    var width = 960,
        height = 600,
        r = 15;

    var force = d3.layout.force()
        .gravity(.07)
        .charge(-250)
        .linkDistance(80)
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
            .attr("class", "edge")
            .on("click", _click);
        edge.exit().remove();

        vertex = vertex.data(_vertices);
        var vertexEnter = vertex.enter().append("g")
            .attr("class", "vertex")
            .on("click", _click)
            .call(force.drag);

        vertexEnter.append("circle")
            .attr("class", function(d) {return d.type; })
            .attr("r", function(d) {
                return d.type == "tx" ? r*(2/3) : r;
            });

        vertexEnter.append("text")
            .attr("dy", ".35em")
            .text(function(d, i) { return i; });

        vertex.exit().remove();

        force.on("tick", _tick);

        force.start();
    };

    _tick = function() {
        edge.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        vertex.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    };

    _click = function(o, i) {
        console.log(o, i);
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

    var n=1;
    var j = builds[b];
    if( j.batch ) {
        n = parseInt(j.batch);
    }

    for( var i=0; i < n; i++ ) {
        j = builds[b];
        // add vertex or edge
        if( j.t == "v" )
            graph.addVertex(j);
        if( j.t == "e" )
            graph.addEdge(j);

        // increment build number
        b++;
        if( b > builds.length ) b = builds.length;
    }
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
