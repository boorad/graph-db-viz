
(function(G) {

    var width = window.innerWidth - 4,
        height = window.innerHeight - 14,
        r = 15;

    var info = d3.select("#info");

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
            .attr("class", function(d) {
                var edgeClass = "";
                switch( d.label ) {
                case "retweeted":
                    edgeClass = " retweet";
                    break;
                default:
                    break;
                }
                return "edge" + edgeClass;
            })
            .on("mouseover", function(d,i) { _hover(d,i); })
            .on("mousemove", function() {
                info.style("top",(d3.event.pageY-10)+"px")
                    .style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function() { info.style("visibility", "hidden"); })
            .on("mouseup", function() { info.style("visibility", "hidden"); });

        edge.exit().remove();

        vertex = vertex.data(_vertices);
        var vertexEnter = vertex.enter().append("g")
            .attr("class", function(d) {return "vertex " + d.type; })
            .on("mouseover", function(d,i) { _hover(d,i); })
            .on("mousemove", function() {
                info.style("top",(d3.event.pageY-10)+"px")
                    .style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function() { info.style("visibility", "hidden"); })
            .on("mouseup", function() { info.style("visibility", "hidden"); })
            .call(force.drag);

        vertexEnter.append("circle")
            .attr("r", function(d) {
                switch( d.type ) {
                case "tx":
                case "item":
                    return r*(2/3);
                    break;
                case "super":
                case "project":
                case "venue":
                case "event":
                    return 2*r;
                    break;
                default:
                    return r;
                }
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

    _hover = function(d,i) {
        d3.selectAll("#info tbody tr").remove();
        var tbody = d3.select("#info tbody");
        var oe = 0;
        var oddeven = "even";
        for(k in d) {
            if( k != "t" && k != "index" && k != "x" && k != "y" && k != "fixed"
                && k != "px" && k != "py" && k != "weight" && k != "batch"
                && k != "source" && k != "target" ) {
                if( oe % 2 == 0 )
                    oddeven = "even";
                else
                    oddeven = "odd";
                var tr = tbody.append("tr")
                    .attr("class", oddeven);
                tr.append("th").text(k);
                tr.append("td").text(d[k]);
                oe++;
            }
        }
        info.style("visibility", "visible");
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
