let color_schemes= {
        'blues': d3.scaleSequential()
        .domain([0, 4])
        .interpolator(d3.interpolateRgb("#b4c6e7", "#093077")),
    'pinks': d3.scaleSequential()
        .domain([0, 5])
        .interpolator(d3.interpolateViridis),
    'viridis': d3.scaleSequential()
        .domain([0, 5])
        .interpolator(d3.interpolateViridis)

}



function load_all_graphs() {
    let line_div = document.getElementById('line-div')
    let horizon_div = document.getElementById('horizon-div')
    line_div.classList.remove = 'closed';
    line_div.style.position = 'relative'
    line_div.style.visibility = 'visible'
    horizon_div.classList.remove = 'closed';
        horizon_div.style.position = 'relative'
    horizon_div.style.visibility = 'visible'
            // document.getElementById('-container').classList.remove = 'closed';


    add_options();
    let op = document.getElementById("opacity-range").value;
    linechart(parseInt(op));
    add_ranges();
    let o = document.getElementById("overlap-range").value;
    let s = document.getElementById("step-range").value;
    console.log("o s", o, s);
    horizon_graph(parseInt(o), parseInt(s))

    // ridgeline_chart()
}


window.onload = function () {
    load_background(3)
    let all_imgs = document.getElementsByClassName('thumbnails')
    for(let i=0; i<all_imgs.length; i++){
        let img = all_imgs[i]
        img.addEventListener("mouseover", function(e){
            img.style.filter = "brightness(50%)"
            let text = document.createElement("DIV")
            text.className = "centered"
            text.id = 'text_'+String(i)
            switch (i) {
                case 0:
                    text.innerText = "Line Chart";
                    break;
                case 1:
                    text.innerText = "Horizon Chart";
                    break;
                case 2:
                    text.innerText = "Density Matrix";
                    break;
            }
            img.parentElement.append(text)

        });
        img.addEventListener("mouseout", function(e){
            img.style.filter = "brightness(100%)"
            document.getElementById("text_"+String(i)).remove()
        });

    }
}


function load_background(num) {
    let colors = ["#b55774", "#ffb862", "#179ea8"];
    var lineGenerator = d3.line()
        .curve(d3.curveCardinal);

    let svg = d3.selectAll("#background-viz")


    for (let i = 0; i < num; i++) {
        let arr_x = Array.from(Array(Math.round(window.innerWidth / 70) + 3), (x, index) => index * 70)
        // let height = Math.round(parseInt(document.getElementById("background-viz").getBBox().height))
        let height = Math.round(window.innerHeight * 0.8 * (i + 1) / 7)
        let arr_y = Array(arr_x.length).fill(1).map(d => d3.randomUniform(height * 0.6, height * 0.9)());
        let points = arr_x.map(function (e, i) {
            return [e, arr_y[i]];
        });
        // console.log(points)

        let line = svg.append("path")
            .attr("class", "line")
            .attr("id", function (d, i) {
                return "line" + i;
            })
            .attr("stroke-linecap", "round")
            .attr("d", lineGenerator(points))
            .attr('fill', 'none')
            .attr("stroke", colors[i])
            .attr("opacity", 0.5)
            .attr("stroke-width", 4)

        var totalLength = line.node().getTotalLength()
        line
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .delay(200 * (i + 1))
            .duration(4000)
            .attr("stroke-dashoffset", 0);
    }
}