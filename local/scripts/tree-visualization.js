// Initializing the Visualization by defining Visualization Size
var height, width;
var margin = {
	top: 20,
	right: 120,
	bottom: 20,
	left: 120
	},
	width = 960 - margin.right - margin.left,
	height = 800 - margin.top - margin.bottom;

	var duration = 750,
	i = 0,
	root;

	var tree = d3.layout.tree()
		.size([ height - 50, width ]);

	var diagonal = d3.svg.diagonal()
		.projection(function (d) {
			return [ d.y, d.x ];
		});

	var svg = d3.select('body').append('svg')
		.attr('width', width + margin.right + margin.left)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	// Importing the rules file in form of JSON into the program
	var json = (function () {
		var json = null;
		$.ajax({
			'async': false,
			'global': false,
			'url': '/pretty.json',
			'dataType': 'json',
			'success': function (data) {
				json = data;
			}
		});
		return json;
	}());
	// Creating layer to adjust the JSON file so that the Visualization can be created
	// Initializing new JSON object
	var output = { 'name': 'Root' };
	output.size = json.size;
	output.mean = json.mean;
	output.colUsed4Split = json.colUsed4Split;
	output.stdev = json.stdev;
	output.children = [];
	// Creating a counter for calculating which layer to store
	a = 0;
		x = json.branches;
		x1 = [];
		x1[a] = x;
		i1 = [];
		i1[a] = 0;
		z = output.children;
		z1 = [];
		z1[a] = z;
		y = Object.keys;
		// loop through and extract properties from json object
		while (x != null) {
			if (y(x).length <= i1[a]) {
				a -= 1;
					x = x1[a];
					z = z1[a];
					i1[a] = i1[a] + 1;
					if (a === -1 || y(x).length <= i1[a]) {
						x = null;
							continue;
					}
			}
			if (y(x)[i1[a]] === '$$other_values') {
				z[i1[a]] = ({ 'name': 'Other' });
			} else {
				z[i1[a]] = ({ 'name': y(x)[i1[a]] });
			}
			z[i1[a]].size = x[y(x)[i1[a]]].size;
				z[i1[a]].mean = x[y(x)[i1[a]]].mean;
				z[i1[a]].colUsed4Split = x[y(x)[i1[a]]].colUsed4Split;
				z[i1[a]].stdev = x[y(x)[i1[a]]].stdev;
				z[i1[a]].children = [];
				x = x[y(x)[i1[a]]].branches;
				z = z[i1[a]].children;
				a += 1;
				x1[a] = x;
				z1[a] = z;
				i1[a] = 0;
				try {
					console.log(x);
					y(x);
				} catch (e) {
					a -= 1;
						x = x1[a];
						z = z1[a];
						i1[a] = i1[a] + 1;
						if (y(x).length === i1[a]) {
							a -= 1;
								x = x1[a];
								z = z1[a];
								i1[a] = i1[a] + 1;
								if (a === -1) {
									x = null;
								}
						}
				}
		}
		root = output;
	root.x0 = height / 2;
	root.y0 = 0;

	function collapse (d) {
		if (d.children && d.depth > 3) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}
	var toTitleCase = function (str) {
		str = str.toLowerCase().split(' ');
		for (var i = 0; i < str.length; i++) {
			str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
		}
		return str.join(' ');
	};
	var nodeList = tree.nodes(root.children[0]);
	// Returns a list of all nodes under the root.
	function flatten (root) {
		var nodes = [],
		i = 0;
		function recurse (node) {
			if (node.children)
				node.children.forEach(recurse);
			if (node._children)
				node._children.forEach(recurse);
			if (!node.id)
				node.id = ++i;
			nodes.push(node);
		}
		recurse(root);
		return nodes;
	}
	function doReset () {
		flatten(root).forEach(function (d) {
			d.color = undefined;
		});
		update(root);
	}
	update(root);
	root.children.forEach(collapse);
	d3.select(self.frameElement).style('height', '800px');
	function update (source) {
		duration = d3.event && d3.event.altKey ? 5000 : 500;
		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse(),
		links = tree.links(nodes);

		// Normalize for fixed-depth.
		nodes.forEach(function (d) {
			d.y = d.depth * 180;
		});

		// Update the nodes…
		var node = svg.selectAll('g.node')
			.data(nodes, function (d) {
				return d.id || (d.id = ++i);
			});

		// Enter any new nodes at the parent's previous position.

		d3.selectAll('path').style('stroke', function (d) {
			if (d.target.color) {
				return d.target.color; // if the value is set
			}
				return 'gray';

		});

		var nodeEnter = node.enter().append('g')
			.attr('class', 'node')
			.attr('transform', function (d) {
				return 'translate(' + source.y0 + ',' + source.x0 + ')';
			})
			.on('click', function (d) {
				var click = d.stdev;
				var click2 = d.name;
				if (click2 == 'Root') {
					doReset();
					return;
				}
				var find = flatten(root).find(function (d) {
						if (d.stdev == click && d.name == click2)
							return true;
					});
				doReset();
				while (find.parent) {
					find.color = 'red';
					find = find.parent;
				}
				toggle(d);
				update(d);
			})
			.on('mouseover', function (d) {
				div.transition()
				.duration(200)
				.style('opacity', 1);
				div.html(
					'Node Name: <b>' + toTitleCase(d.name) + '<br/>' + '<br/></b>' +
					'Mean:      <b>' + d.mean.toFixed(2) + '<br/>' + '<br/></b>' +
					'Stdev:     <b>' + d.stdev.toFixed(2) + '<br/>' + '<br/></b>' +
					'Size:      <b>' + d.size + '</b>')
				.style('left', (d3.event.pageX) + 'px')
				.style('top', (d3.event.pageY - 28) + 'px');
			})
			.on('mouseout', function (d) {
				div.transition()
				.duration(500)
				.style('opacity', 0);
			});
		nodeEnter.append('circle')
		.attr('r', 1e-6)
		.style('fill', function (d) {
			return d._children ? 'lightsteelblue' : '#fff';
		});

		nodeEnter.append('text')
		.attr('x', function (d) {
			return d.children || d._children ? -10 : 10;
		})
		.attr('dy', '0.00em')
		.attr('text-anchor', function (d) {
			return d.children || d._children ? 'end' : 'start';
		})
		.text(function (d) {
			return toTitleCase(d.name);
		})
		.style('fill-opacity', 1e-6);

		nodeEnter.append('text')
		.attr('x', function (d) {
			return d.children || d._children ? -10 : 10;
		})
		.attr('dy', '1.30em')
		.attr('text-anchor', function (d) {
			return d.children || d._children ? 'end' : 'start';
		})
		.text(function (d) {
			return (d.colUsed4Split) ? (toTitleCase('Split On ' + d.colUsed4Split)) : '  ';
		})
		.style('fill-opacity', 1e-6);

		var div = d3.select('body').append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0);

		var nodeUpdate = node.transition()
			.duration(duration)
			.attr('transform', function (d) {
				return 'translate(' + d.y + ',' + d.x + ')';
			});

		nodeUpdate.select('circle')
		.attr('r', 4.5)
		.style('fill', function (d) {
			return d._children ? 'lightsteelblue' : '#fff';
		});

		nodeUpdate.selectAll('text')
		.style('fill-opacity', 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr('transform', function (d) {
				return 'translate(' + source.y + ',' + source.x + ')';
			})
			.remove();

		nodeExit.select('circle')
		.attr('r', 1e-6);

		nodeExit.selectAll('text')
		.style('fill-opacity', 1e-6);

		// Update the links…
		var link = svg.selectAll('path.link')
			.data(links, function (d) {
				return d.target.id;
			});

		// Enter any new links at the parent's previous position.
		link.enter().insert('path', 'g')
		.attr('class', 'link')
		.attr('d', function (d) {
			var o = {
				x: source.x0,
				y: source.y0
			};
			return diagonal({
				source: o,
				target: o
			});
		});

		// Transition links to their new position.
		link.transition()
		.duration(duration)
		.attr('d', diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
		.duration(duration)
		.attr('d', function (d) {
			var o = {
				x: source.x,
				y: source.y
			};
			return diagonal({
				source: o,
				target: o
			});
		})
		.remove();

		// Stash the old positions for transition.
		nodes.forEach(function (d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}
	toggle = function (d) {
		if (d.children) {
			d._children = d.children;
			return d.children = null;
		}
			d.children = d._children;
			return d._children = null;

	};
