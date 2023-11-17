import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './App.css';

const App = () => {
    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipStyle, setTooltipStyle] = useState({ visibility: 'hidden', opacity: 0 });
    const [dataYear, setDataYear] = useState('');

    useEffect(() => {
        const width = 800;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 50, left: 60 };

        const svg = d3.select('#scatterplot')
            .attr('width', width)
            .attr('height', height);

        d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
            .then(data => {
                data.forEach(d => {
                    d.Year = new Date(d.Year.toString());
                    d.Time = new Date('1970-01-01T00:' + d.Time.toString());
                });

                const xScale = d3.scaleTime()
                    .domain([new Date('1993-01-01'), d3.max(data, d => d.Year)])
                    .range([margin.left, width - margin.right]);

                const yScale = d3.scaleTime()
                    .domain(d3.extent(data, d => d.Time))
                    .range([height - margin.bottom, margin.top]);

                svg.append('g')
                    .attr('id', 'x-axis')
                    .attr('transform', `translate(0, ${height - margin.bottom})`)
                    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y')));

                svg.append('g')
                    .attr('id', 'y-axis')
                    .attr('transform', `translate(${margin.left}, 0)`)
                    .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S')));

                const handleMouseOver = (event, d) => {
                    setTooltipContent(`Year: ${d.Year.getFullYear()}<br>Time: ${d3.timeFormat('%M:%S')(d.Time)}<br>Name: ${d.Name}<br>${d.Doping ? 'Doping Allegation: ' + d.Doping : 'No Doping Allegation'}`);
                    setTooltipStyle({
                        visibility: 'visible',
                        opacity: 0.9,
                        left: `${event.pageX + 5}px`,
                        top: `${event.pageY - 28}px`
                    });
                    setDataYear(d.Year.toISOString().substring(0, 4));
                };

                const handleMouseOut = () => {
                    setTooltipStyle({ visibility: 'hidden', opacity: 0 });
                };

                svg.selectAll('.dot')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('class', 'dot')
                    .attr('r', 5)
                    .attr('cx', d => xScale(d.Year))
                    .attr('cy', d => yScale(d.Time))
                    .attr('data-xvalue', d => d.Year.getFullYear())
                    .attr('data-yvalue', d => d.Time.toISOString())
                    .style('fill', d => d.Doping ? 'red' : 'blue')
                    .on('mouseover', handleMouseOver)
                    .on('mouseout', handleMouseOut);
            });

        return () => {
            svg.selectAll('*').remove(); // Cleanup SVG elements on component unmount
        };
    }, []);

    return (
      <div className="border">
          <h1 id="title">Scatterplot Graph</h1>
          <div className="chart-container">
              <div id="chart">
                  <svg id="scatterplot" width="800" height="400">
                      {/* Your SVG elements */}
                  </svg>
                  <div id="legend">
                      <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: 'red' }}></div>
                          Riders with doping allegations
                      </div>
                      <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: 'blue' }}></div>
                          Riders without doping allegations
                      </div>
                  </div>
              </div>
          </div>
          <div id="tooltip" style={tooltipStyle} dangerouslySetInnerHTML={{ __html: tooltipContent }} data-year={dataYear}>
              {/* Tooltip content set via React state */}
          </div>
      </div>
  );
};

export default App;
