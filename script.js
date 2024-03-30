
const containerWidth  = 1200;
const containerHeight = 690;


const margin = {top: 30, right: 30, bottom: 130, left: 60};


const  chartWidth = containerWidth - margin.left - margin.right;
const  chartHeight = containerHeight - margin.top - margin.bottom;


d3.select(".chart-container").attr("style",`width:${containerWidth}px`)

const svg = d3.select("#chart")
              .attr("width", containerWidth)
              .attr("height",containerHeight)
              .append("g")
              .attr("transform",`translate(${margin.left},${margin.top})`);


d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then( (data)=> {
  
  const parseTime = d3.timeParse("%Y");
  const timeTickFormat = d3.timeFormat('%M:%S');
  
  
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
  
  data = data.map( (d) => {
    let timeFormat = d.Time.split(':')
    return {
            ...d,
            Year: parseTime(d.Year),
            Time: new Date(1970, 0, 1, 0, timeFormat[0], timeFormat[1])}
     })
  
  
  const xScale = d3.scaleTime()
  .range([0, chartWidth])
  .domain(d3.extent(data,(d)=> d.Year))
  
  const getXScaleDomain = (index) => {
    return xScale.domain()[index]
  }
  xScale.domain(
    [
  getXScaleDomain(0).setFullYear(getXScaleDomain(0).getFullYear() - 1),  getXScaleDomain(1).setFullYear(getXScaleDomain(1).getFullYear() + 1)])
  
  
  svg.append("g")
  .attr("transform", `translate(0, ${chartHeight})`)
  .attr("id","x-axis")
  .call(d3.axisBottom(xScale)
        .tickSizeOuter(0)
       )
  
  
  const yScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.Time))
    .range([chartHeight, 0]);

  
  svg.append("g")
    .attr("id","y-axis")
    .call(d3.axisLeft(yScale)
         .tickSizeOuter(0)
          .tickFormat(timeTickFormat)
         );
  
  
  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("class","dot")
    .attr("cx", d => xScale(d.Year))
    .attr("cy", d => yScale(d.Time))
    .attr("r", 8)
    .attr("fill", (d)=> { return colorScale(d.Nationality)})
    .attr("data-xvalue", d => d.Year)
    .attr("data-yvalue", d => d.Time)
    .attr("name", d => d.Name)
    
  
  
  .on('mousemove', function(event) {
    const dataYear = d3.select(this).attr("data-xvalue");
    const name = d3.select(this).attr("name");
    const [posX,posY] = [(d3.event.pageX + 5) + "px",(d3.event.pageY - 5) + "px"];
    d3.select("#tooltip")
        .attr("data-year", dataYear)
        .style('left', posX)
        .style('top', posY)
        .style('visibility', 'visible')
        .html(name);

    d3.select(this).style('stroke', 'blue');
  })
  
  
  .on('mouseout', (d) => {
     d3.selectAll('.dot').style('stroke', '');
     d3.select("#tooltip").attr('style', 'visibility: hidden;');
  })
  
  
  const legendRectWidth = 60;
  const legendRectHeight = 15;
  
  
  const legendScale = d3.scaleBand()
                       .domain(colorScale.domain())
                       .range([0,legendRectWidth*colorScale.range().length])

  
  svg.append("g")
     .attr('transform', (d,i) => `translate(${(chartWidth/2-(legendScale.range()[1])/2)+legendRectWidth*i},${chartHeight+legendRectHeight+margin.bottom/2})`)
     .call(d3.axisBottom(legendScale)
          .tickSizeOuter(0));

  svg.append("g")
      .attr("id","legend")
      .selectAll("rect")
      .data(colorScale.range())
      .join('rect')
      .attr("class","legend-item")
      .attr('width', legendRectWidth)
      .attr('height', legendRectHeight)
      .style('fill', d => d)
      .attr('transform', (d,i) => `translate(${(chartWidth/2-(legendScale.range()[1])/2)+legendRectWidth*i},${chartHeight+margin.bottom/2})`);
  
  })



