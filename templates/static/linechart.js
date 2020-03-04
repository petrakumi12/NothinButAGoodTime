let linechart = () => {
    let opacity = 0.1;

    let margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 900 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    let svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("mix-blend-mode", "hard-light")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let min = 100, max = -100;
    let generateTS = (id="", startTime = 0) => {
        let tempData = Array(256);
        tempData[0] = {"x": 0, "y": 0, "event": 0};
        for (let i = 1; i <= 256; i++) {
            let diff = Math.random() - 0.5;
            tempData[i] = {
                "x": i + startTime,
                "y": tempData[i - 1]["y"] + diff,
                "event": id === "ts_1" ? 1 : 0
            };

            if (tempData[i]["y"] > max) {
                max = tempData[i]["y"]
            } else if (tempData[i]["y"] < min) {
                min = tempData[i]["y"]
            }
        }

        let tempDict = {"name": id};
        tempDict["vals"] = tempData.slice(1);
        return tempDict;
    };
    // [{"name": name, "vals": [{"x": x, "y": y}]}]

    let getClosest = (mydata, pt) => {
        let closest = mydata[0]
        for (let i = 0; i < mydata.length; i++) {
            if (mydata[i].x === pt) {
                return mydata[i]
            }
            else if (Math.abs(mydata[i].x - pt) < Math.abs(closest.x - pt)) {
                closest = mydata[i]
            }
        }
        return closest;
    };

    // // TODO comment for 1 TS, uncomment for array of TS
    // let data = [];
    // for (let j = 0; j < 25; j++) {
    //     // console.log("before", data)
    //     data.push(generateTS("ts_"+(j%5).toString(), Math.floor(Math.random() * 1500)))
    //     // console.log("after", data)
    // }

    let data = final_arr;

    console.log("data", data);

    let getHighlightIntervals = (data) => {
        let intervals = [];

        for (let j = 0; j < data.length; j++) {
            let temp = data[j];

            let inInterval = false;
            let intervalStart = -1;
            for (let i = 0; i < temp.vals.length; i++) {
                if (temp.vals[i].event === 1 && !inInterval) {
                    intervalStart = temp.vals[i].x;
                    inInterval = true;
                } else if (inInterval && temp.vals[i].event === 0) {
                    intervals.push([intervalStart, temp.vals[i].x]);
                    intervalStart = -1;
                    inInterval = false;
                }
            }
            if (inInterval) {
                intervals.push([
                    intervalStart,
                    temp.vals[temp.vals.length - 1].x +
                    (temp.vals[temp.vals.length - 1].x - temp.vals[temp.vals.length - 2].x)])
            }
        }

        return intervals;
    };
    let intervals = getHighlightIntervals(data);

    let xmax = d3.max(data, dt => {
        return d3.max(dt.vals, datum => {
            return datum.x;
        });
    });
    let xmin = d3.min(data, dt => {
        return d3.min(dt.vals, datum => {
            return datum.x;
        });
    });
    let x0 = [xmin, xmax];
    var x = d3.scaleLinear()
        .domain(x0)
        .range([0, width]);

    max = d3.max(data, dt => {
        return d3.max(dt.vals, datum => {
            return datum.y;
        });
    });
    min = d3.min(data, dt => {
        return d3.min(dt.vals, datum => {
            return datum.y;
        });
    });
    let y0 = [min, max];
    let y = d3.scaleLinear()
        .domain(y0)
        .range([height - margin.top - margin.bottom, 0]);

    let highlights = svg.append("g").attr("pointer-events", "none").selectAll("rect")
        .data(intervals)
        .enter()
        .append("rect")
        .attr("y", 0)
        .attr("x", d => x(d[0]))
        .attr("width", d => (x(d[1]) - x(d[0])))
        .attr("height", "100%")
        .attr("fill", "aquamarine")
        .attr("opacity", 0.5);

    let newData = [];
    data.forEach(d => {
        let max = d3.max(d.vals, pt => pt.y);
        let min = d3.min(d.vals, pt => pt.y);
        // svg.append("g")
        //     .selectAll("line")
        //     .data([mean])
        //     .enter()
        //     .append("line")
        //     .attr("y1", d => y(d))
        //     .attr("y2", d => y(d))
        //     .attr("x1", 0)
        //     .attr("x2", 10000)
        //     .attr("stroke-width", 1)
        //     .attr("stroke", "steelblue")
        //  console.log("mean", mean)
        //  console.log("stddev", stddev)

        let datum = d.vals.map(pt => { return (pt["y"] - min) / (max - min) });
        newData.push(datum)
    });

    let idleTimeout, idleDelay = 350;

    let line = d3.line()
        .x((d) => {return x(d["x"])})
        .y((d) => {return y(d["y"])});

    let xAxis = svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
        .call(d3.axisBottom(x));

    let yAxis = svg.append("g")
        .attr("id", "yAxis")
        .call(d3.axisLeft(y));

    let brush = d3.brush()
        .extent( [ [0,0], [width,height] ] );

    let brushG = svg.append("g")
        .attr("class", "brush")
        .call(brush);

    let line1 = svg.append("g")
        .attr("pointer-events", "none")
        .append("line");
    let line2 = svg.append("g")
        .attr("pointer-events", "none")
        .append("line");

    // console.log(svg)
    let paths = svg.append("g").selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr('pointer-events', 'stroke')
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("d", d => {return line(d.vals) })
        .attr("opacity", opacity)
        .attr("class", d => {return d.name});

    let tooltipG = svg.append("g").attr("pointer-events", "none");
    let tooltipRect = tooltipG
        .append("rect")
        .attr("width", 320)
        .attr("height", 30)
        .attr("rx", 5)
        .attr("opacity", 0)
        .attr("fill", "white")
        .attr("stroke", "black");

    let tooltip = tooltipG
        .append("text")
        .attr("dx", (tooltipRect.attr("width") / 2))
        .attr("dy", "1.25em")
        .style("text-anchor", "middle");

    let click = (d, i, nodes) => {
        let ts = d3.selectAll("." + d.name);
        if ("selected" in d) {
            ts.datum(d => {
                d.selected = !d.selected;
                return d
            });
        }
        else {
            ts.datum(d => {
                d["selected"] = true;
                return d;
            })
        }

        if (d.selected) {
            ts
                .attr("opacity", 1)
                .attr("stroke-width", 3);
        }
        else {
            ts
                .attr("opacity", opacity)
                .attr("stroke-width", 2);
        }
    };

    let mouseover = (d, i, nodes) => {
        d3.selectAll("." + d.name)
            .attr("opacity", 1)
            .attr("stroke-width", 3);
    };

    let mouseleave = (d, i, nodes) => {
        // console.log(d);
        if (!("selected" in d) || !d.selected) {
            d3.selectAll("." + d.name)
                .attr("opacity", opacity)
                .attr("stroke-width", 2);
        }

        line1.attr("opacity", 0);
        line2.attr("opacity", 0);
        tooltip.attr("opacity", 0);
        tooltipRect.attr("opacity", 0);
    };

    let mousemove = (d, i, nodes) => {
        let mouse = d3.mouse(nodes[i]);
        let closePoint = getClosest(d.vals, x.invert(mouse[0]));
        console.log(x.invert(mouse[0]), y.invert(mouse[1]));
        console.log(closePoint);
        line1.datum(closePoint)
            .attr("x1", d => x(0))
            .attr("x2", d => x(d.x))
            .attr("y1", d => y(d.y))
            .attr("y2", d => y(d.y))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("opacity", 1);

        line2.datum(closePoint)
            .attr("x1", d => x(d.x))
            .attr("x2", d => x(d.x))
            .attr("y1", d => y(min))
            .attr("y2", d => y(d.y))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("opacity", 1);

        tooltipRect
            .attr("x", mouse[0] - tooltipRect.attr("width") / 2)
            .attr("y", mouse[1] - tooltipRect.attr("height") - 10)
            .attr("opacity", 0.7);

        tooltip
            .text(closePoint.x + ", " + closePoint.y)
            .attr("transform", "translate(" +
                (mouse[0] - tooltipRect.attr("width") / 2) + "," +
                (mouse[1] - tooltipRect.attr("height") - 10) + ")")
            .attr("opacity", 1);
    };

    paths
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .on("click", click)
        .on("mousemove", mousemove);

    zoom = () => {
        let selection = d3.event.selection;
        // console.log(selection);
        if (!selection) {
            if (!idleTimeout) return idleTimeout = setTimeout(() => {idleTimeout = null}, idleDelay);
            x.domain(x0);
            y.domain(y0);
        } else {
            x.domain([selection[0][0], selection[1][0]].map(x.invert, x));
            y.domain([selection[1][1], selection[0][1]].map(y.invert, y));
            brushG.call(brush.move, null);
        }

        line = d3.line()
            .x((d) => {return x(d["x"])})
            .y((d) => {return y(d["y"])});
        paths.transition().duration(500)
            .attr("d", function(d) { return line(d.vals); });

        xAxis.transition().duration(500).call(d3.axisBottom(x));
        yAxis.transition().duration(500).call(d3.axisLeft(y));

        highlights
            .transition()
            .duration(500)
            .attr("x", d => x(d[0]))
            .attr("width", d => (x(d[1]) - x(d[0])))
    };

    brush.on("end", zoom);
};