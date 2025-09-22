import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Paper, Typography } from '@mui/material';

const D3Chart = ({
  data,
  type = 'bar',
  width = 600,
  height = 400,
  title = 'D3 Chart',
  xLabel = 'X Axis',
  yLabel = 'Y Axis'
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px');

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([innerHeight, 0])
      .nice();

    // Colors
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '12px');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('')
      );

    // Bars/Lines/Circles
    if (type === 'bar') {
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.label))
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', (d, i) => colorScale(i))
        .attr('rx', 4)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);

          tooltip
            .style('opacity', 1)
            .html(`<strong>${d.label}</strong><br/>Value: ${d.value}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          tooltip.style('opacity', 0);
        })
        .transition()
        .duration(800)
        .attr('y', d => yScale(d.value))
        .attr('height', d => innerHeight - yScale(d.value));

    } else if (type === 'line') {
      const line = d3.line()
        .x(d => xScale(d.label) + xScale.bandwidth() / 2)
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colorScale(0))
        .attr('stroke-width', 3)
        .attr('d', line)
        .attr('stroke-dasharray', function() {
          const length = this.getTotalLength();
          return length + ' ' + length;
        })
        .attr('stroke-dashoffset', function() {
          return this.getTotalLength();
        })
        .transition()
        .duration(2000)
        .attr('stroke-dashoffset', 0);

      // Add dots
      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.label) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.value))
        .attr('r', 0)
        .attr('fill', colorScale(0))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('r', 8);

          tooltip
            .style('opacity', 1)
            .html(`<strong>${d.label}</strong><br/>Value: ${d.value}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function(event, d) {
          d3.select(this).attr('r', 5);
          tooltip.style('opacity', 0);
        })
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr('r', 5);

    } else if (type === 'pie') {
      const radius = Math.min(innerWidth, innerHeight) / 2;

      const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

      const labelArc = d3.arc()
        .innerRadius(radius - 40)
        .outerRadius(radius - 40);

      const pieGroup = g.append('g')
        .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

      const arcs = pieGroup.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

      arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colorScale(i))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);

          tooltip
            .style('opacity', 1)
            .html(`<strong>${d.data.label}</strong><br/>Value: ${d.data.value}<br/>${((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(1)}%`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          tooltip.style('opacity', 0);
        })
        .transition()
        .duration(1000)
        .attrTween('d', function(d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function(t) {
            return arc(interpolate(t));
          };
        });

      // Labels
      arcs.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'white')
        .style('font-weight', 'bold')
        .text(d => d.data.value > 10 ? d.data.label : '')
        .style('opacity', 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style('opacity', 1);
    }

    // Labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(xLabel);

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(yLabel);

  }, [data, type, width, height, title, xLabel, yLabel]);

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No data available for chart
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </Box>
  );
};

export default D3Chart;
