var container = null;
var uk_map_data = null;
var constituency_data = null;

function init()
{
	document.getElementById("run_RF_button").addEventListener("click", call_RF, false);
	document.getElementById("details_tab_button").addEventListener("click", 
	function(event)
	{
		open_tab(event, "details_tab");
	},
	false);

	document.getElementById("vis_tab_button").addEventListener("click",
	function(event)
	{
		open_tab(event, "vis_tab");
	},
	false);

	document.getElementById("details_tab").style.display = "block";
	document.getElementById("details_tab_button").className += " active";

	d3.json("/data/outcomes.json").then
	(
		function(data)
		{
			var clinical_outcomes_list = document.getElementById("clinical_outcomes");
			var provider_outcomes_list = document.getElementById("provider_outcomes");
			var clinical_outcomes = data.clinical_outcomes;
			var provider_outcomes = data.provider_outcomes;
			clinical_outcomes.forEach
			(
				function(outcome)
				{
					var node = document.createElement("li");
					node.setAttribute("class", "outcome");
					node.appendChild(document.createTextNode(outcome));
					clinical_outcomes_list.append(node);
				}
			);
			provider_outcomes.forEach
			(
				function(outcome)
				{
					var node = document.createElement("li");
					node.setAttribute("class", "outcome");
					node.appendChild(document.createTextNode(outcome));
					provider_outcomes_list.append(node);
				}
			);
			var outcomes = document.querySelectorAll(".outcome");
			outcomes.forEach
			(
				function(element)
				{
					element.addEventListener("click",
						function()
						{
							toggle_active_outcome(element);
						}
					);
				}
			);
			outcomes[0].className += " active";
		}
	);
	load_map_data();
}

function toggle_active_outcome(outcome)
{
	var contents = document.getElementsByClassName("outcome");
	for(var i = 0; i < contents.length; i++)
	{
		contents[i].className = contents[i].className.replace(" active", "");
	}
	outcome.className += " active";
}

function open_tab(event, tab)
{
	var tab_contents = document.getElementsByClassName("tab_content");
	for(var i = 0; i < tab_contents.length; i++)
	{
		tab_contents[i].style.display = "none";
	}
	
	var tab_links = document.getElementsByClassName("tab_link");
	for(i = 0; i < tab_links.length; i++)
	{
		tab_links[i].className = tab_links[i].className.replace(" active", "");
	}
	
	document.getElementById(tab).style.display = "flex"
	event.currentTarget.className += " active";
	
	if(tab === "vis_tab")
	{
		refresh_vis_card_layout();
	}
}

function call_RF()
{
	var target_feature = d3.selectAll(".outcome").filter(".active").text();
	var number_of_predictors = d3.select("#number_of_predictors_picker").property("value");
	$.ajax(
	{
		type: "POST",
		url: `/run_RF/${target_feature}`,
		dataType: "json",
		success: function(data)
		{
			console.log(data);
			get_importances(number_of_predictors).success
			(
				function(data)
				{
					var importance_list_item_content = d3.select("#vis_tab").append("div").attr("id", "importance_grid").classed("item", true).append("div").classed("item-content", true);
					importance_list_item_content.append("p").text("Importances:");
					importance_list_item_content.append("ul").attr("id", "importances_list");
					//Create importances list
					d3.select("#importances_list").selectAll("li").data(Object.entries(data)).enter().append("li")
					.text
					(
						function(datum, index, nodes)
						{
							return `${datum[0]} : ${datum[1]}`;
						}
					);
					
					//Create individual vis cards for each important variable
					var map_vis_cards_selection = d3.select("#vis_tab")
					.selectAll
					(
						function(datum, index, nodes)
						{
							return [];
						}
					).data(Object.entries(data)).enter().append("div").classed("item", true)
					.append("div").classed("item-content", true);
					map_vis_cards_selection.append("p")
					.text
					(
						function(datum, index, nodes)
						{
							return `${datum[0]} : ${datum[1]}`;
						}
					);
					map_vis_cards_selection.append("div").classed("map_vis", true)
					.attr("id",
						function(datum, index, nodes)
						{
							return `vis_${index}`;
						}
					);
					for(var i = 0; i < Object.entries(data).length; i++)
					{
						draw_map_vis(uk_map_data, constituency_data, i, Object.values(data)[i]);
					}
					create_vis_cards();
				}
			);

		},
		error: function(request, status, error)
		{
			console.log("ERROR:");
			console.log(status);
			console.log(error);
		}
	});
}

function should_start_drag(item, e)
{
	var vis_card_element_name = e.srcEvent.srcElement.tagName.toLowerCase();
	return vis_card_element_name !== "svg" && vis_card_element_name !== "path";
}

function refresh_vis_card_layout()
{
	if(container !== null)
	{
		container.refreshItems();
		container.layout(true);
	}
}

function create_vis_cards()
{
	if(container === null)
	{
		container = new Muuri('#vis_tab',
		{
			layoutDuration: 400,
			dragEnabled: true,
			dragSortInterval: 0,
			dragStartPredicate: should_start_drag
		}
		);
	}
	refresh_vis_card_layout();
}

function get_importances(number_of_predictors)
{
	return $.ajax(
	{
		type: "POST",
		url: `/importances/${number_of_predictors}`,
		dataType: "json",
		error: function(request, status, error)
		{
			console.log("ERROR:")
			console.log(status)
			console.log(error)
		}
	});
}

function load_map_data()
{
	var files = ["../data/wpc.json", "../data/mp_data.csv"];
	var promises = [];
	console.log(files[0])
	promises.push(d3.json("../data/wpc.json"));
	promises.push(d3.csv("../data/mp_data.csv"));
	Promise.all(promises).then(
	function(data)
	{
		uk_map_data = data[0];
		constituency_data = data[1];
	}
	);
}

function draw_map_vis(boundary_data, mp_data, importance_variable, importance_value)
{
	var width = 500;
	var height = 300;
	var projection = d3.geoAlbers()
	.center([0, 55.4])
	.rotate([4.4, 0])
	.parallels([50, 60])
	.scale(6000)
	.translate([width/2, height/2]); 
	var svg = d3.select(`#vis_${importance_variable}`).append("svg").attr("width", width).attr("height", height);
	var path = d3.geoPath().projection(projection);
	var g = svg.append("g");
		
	var zoom = d3.zoom().on("zoom", do_zoom);

	function do_zoom()
	{
		g.attr('transform', d3.event.transform);
	}
	svg.call(zoom);

	var b = path.bounds(topojson.feature(boundary_data, boundary_data.objects["wpc"]));
	
	var paths = g.selectAll("path")
	.data(topojson.feature(boundary_data, boundary_data.objects["wpc"]).features);
	paths.enter().append("path").attr("d", path).attr("fill",
		function()
		{
			var min_importance = 0.01;
			var max_importance = 0.04;
			var adjusted_importance_value = (importance_value - min_importance)/(max_importance - min_importance);
			return d3.interpolateRdYlBu(1.0 - adjusted_importance_value);
		}
	);
}

init();