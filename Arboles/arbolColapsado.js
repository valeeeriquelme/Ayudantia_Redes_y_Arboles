const WIDTH = 1500;
const HEIGHT = 1500;
const MARGIN = {
    top: 30,
    right: 50,
    left: 30,
    bottom: 50,
}

const svg = d3.select("body")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)

const contenedorArbol = svg.append("g")
    .attr("transform", `translate(${MARGIN.top} ${MARGIN.left})`);

function joinDeDatos(raiz) {
    // https://github.com/d3/d3-hierarchy

    let layout = d3.tree();
    layout.size(
        [WIDTH - MARGIN.left - MARGIN.right, 
        HEIGHT - MARGIN.top - MARGIN.bottom]
    );

    layout(raiz);
    
    console.log(raiz)
    raiz.parent = raiz

    const generadorDeEnlace = d3
        .linkHorizontal()
        .source((d) => d.source)
        .target((d) => d.target)
        .x((d) => d.y)
        .y((d) => d.x)
        
    contenedorArbol
        .selectAll("circle")
        .data(raiz.descendants(), d => d.id)
        .join(
            (enter) => {
                enter
                    .append("circle")
                    .attr("r", 3)
                    .attr("cx", (d) => d.parent.y)
                    .attr("cy", (d) => d.parent.x)
                    .on("click", (event, d) => collapseNode(raiz, d))
                    .transition()
                    .duration(1000)
                    .attr("cx", (d) => d.y)
                    .attr("cy", (d) => d.x)
                    .attr("cursor", "pointer")
                    .selection()
            },
            (update) => {
                update
                    .transition()
                    .duration(1000)
                    .attr("cx", (d) => d.y)
                    .attr("cy", (d) => d.x)
                    .attr("r", 3)
                    .attr("cursor", "pointer")
                    .selection()
            },
            (exit) => {
                exit
                    .transition()
                    .duration(1000)
                    .attr("cx", (d) => d.parent.y)
                    .attr("cy", (d) => d.parent.x)
                    .attr("r", 0)
                    .remove()
            }
        )

    contenedorArbol
        .selectAll("path")
        .data(raiz.links(), d => d.target.id)
        .join(
            (enter) => {
                enter
                    .append("path")
                    .attr("d", generadorDeEnlace)
                    .attr("stroke", "gray")
                    .attr("fill", "none")
                    .transition()
                    .duration(1000)
                    .selection()
            },
            (update) => {
                update
                    .transition()
                    .duration(1000)
                    .attr("d", generadorDeEnlace)
                    .attr("stroke", "gray")
                    .attr("fill", "none")
                    .selection()
            },
            (exit) => {
                exit
                    .transition()
                    .duration(1000)
                    .attr("stroke", "white")
                    .remove()
            }
        )
        
    
    contenedorArbol
        .selectAll("text")
        .data(raiz.descendants(), d => d.id)
        .join(
            (enter) => {
                enter
                    .append("text")
                    .attr("x", (d) => d.y)
                    .attr("y", (d) => d.x)
                    .text((d) => d.data.name.length < 7 ? d.data.name : d.data.name.slice(0, 7) + "...")
                    .transition()
                    .duration(1000)
                    .attr("font-size", 12)
                    .attr("text-anchor", "start")
                    .attr("dominant-baseline", "hanging")
                    .attr("dx", 6)
                    .selection()
            },
            (update) => {
                update
                    .transition()
                    .duration(1000)
                    .attr("x", (d) => d.y)
                    .attr("y", (d) => d.x)
                    .selection()
            },
            (exit) => {
                exit
                    .transition()
                    .duration(1000)
                    .attr("font-size", 0)
                    .remove()
            }
        )
        
}

function collapseNode(raiz, node) {
    if (!node.isCollapsed) {
        node.isCollapsed = true;
        node.children = null;
        node.childrenCollapsed.map((d, i) => {
            d.isCollapsed = true;
            d.children= null;
        });
    } else {
        node.isCollapsed = false;
        node.children = node.childrenCollapsed;
        node.childrenCollapsed.map((d, i) => {
            d.isCollapsed = false;
            d.children = d.childrenCollapsed;
        });
    }

    joinDeDatos(raiz)
}


d3.json("chile.json")
    .then((datos) => {
        let raiz = d3.hierarchy(datos, (d) => d.children);

        raiz["childrenCollapsed"] = [...raiz.children]
    
        raiz.descendants().map((d, i) => {
            d.id = i;
            d.children? d.children = d.children : d.children = null;
            d.children? d.childrenCollapsed = d.children : d.childrenCollapsed = null;
            d.isCollapsed = false;
        });

        joinDeDatos(raiz)
    })