import React, { Component } from 'react';
import { connect } from 'react-redux';
import dataVisual from '../reducers/index';
import d3 from 'd3';
import _ from 'lodash';

  // Styles
  const filler = {
    fill: 'white',
    textAnchor: 'middle'
  }
  const alt = {
    fill : 'steelblue',
    textAnchor: 'middle'
  }

  // Cross-cutting-concerns, MIXINS
  const SetIntervalMixin = {
    componentWillMount: function() {
      this.intervals = [];
    },
    setInterval: function() {
      this.intervals.push(setInterval.apply(null, arguments));
    },
    componentWillUnmount: function() {
      this.intervals.map(clearInterval);
    }
  };

  // CHART COMPONENT returns svg tags
  let Chart = React.createClass({
    render: function () {
      return (
        <svg className="svg" width={ this.props.width }
             height={ this.props.height } >
              { this.props.children }
        </svg>
      )
    }
  });

  // BAR COMPONENT with scaling functionality
  let Bar = React.createClass({
    getDefaultProps: function() {
      return {
        data: []
      }
    },

    render: function () {
      // has data, width, and height
      let props = this.props;
      // array of objects, query, location, totalResults
      let totalResult = _.map(props.data, function (obj) {
        return obj.totalResults;
      });
        
      // Initial state, data is empty array, so nothing breaks. When submit, populates the data array, let data be totalResult.
      let data = props.data.length > 0 ? totalResult : props.data;
      // If data is not an empty array, calculate of 25 percent of max value in array.
      let paddingValue = data.length > 0 ? d3.max(data) * 0.25 : 0;
      // Create a xScale to scale width inputs of array length
      let xScale = d3.scale.ordinal()
                     .domain(d3.range(data.length))
                     .rangeRoundBands([0, props.width], 0.2)
      // padding: domain input of 0 to max with height padding
      let yScale = d3.scale.linear()
                     .domain( [ 0, d3.max(data) + paddingValue] )
                     .range([0, props.height])
      // Color to each individual bar              
      var color = d3.scale.category20()
                          .domain(d3.range(data.length))
                          .range()
                        
      // Will not iterate on empty array, if array is populated, it will run.
      let bars = props.data.map(function(obj, i) {
      // scale the height
      let height = yScale(obj.totalResults),
          // scale width using rangeBand, outputs an integer
          width = xScale.rangeBand(),
          // props height minus scaled height
          y = props.height - height,
          // scale index
          x = xScale(i);
        // For each iteration, send props to Rect component
        return (
          <g>
            <Rect
              key = { obj.location }
              width = { width }
              height = { height }
              x = { x }
              y = { y }
              data = { obj.totalResults }
              location = { obj.location }
              color={color[i]}
            />
          </g>
        )
      });
      // When bar returns, render contents of bars
      return (
        <g>{bars}</g>
      )
    }
  });

  //RECT COMPONENT with transition functionality
  var Rect = React.createClass({
    // use Mixins to cancel setIntervals when not needed
    mixins: [SetIntervalMixin],
    getDefaultProps: function () {
      return {
        width: 0,
        height: 0,
        x: 0,
        y: 0
      }
    },
    
    getInitialState: function () {
      return {
        milliseconds: 0,
        height: 0
      }
    },

    // When component receives new props, reset milliseconds back to 0.
    componentWillReceiveProps: function (nextProps) {
      this.setState({milliseconds: 0})
    },
    // When render activates, run the setInterval with the tick function.
    componentDidMount: function () {
      // Call enter methods here
      this.setInterval(this.tick, 10);
    },
    // Every tick, add 10 to the state.milliseconds
    tick: function (start) {
        this.setState({milliseconds: this.state.milliseconds + 10});
    },

    render: function () {
      
      var bounce = d3.ease('back-out'),
          height = this.state.height 
          + (this.props.height - this.state.height) 
          * bounce(Math.min(1, this.state.milliseconds/1200)),
          style = height < 35 ? alt : filler,
          adjustedY = (this.props.height - height) + this.props.y,
          yProps = this.props.y,
          xProps = this.props.x,
          wProps = this.props.width;

      return (
        <g>
          <rect
            className = 'bar'
            height={ height < 5 ? height = 25 : height }
            width={ wProps }
            x={ xProps }
            y={ adjustedY }
            style={ {fill: this.props.color} } 
            >
          </rect>
          <text
            x={ xProps + ( wProps/2) }
            y={ height < 35 ? yProps-15 : yProps+30}
            style={ style } 
            >
            { this.props.data }
          </text>
          <text
            x={ xProps + (this.props.width/2) }
            style={ { textAnchor: 'middle', textTransform: 'capitalize' } }
            y={ height < 35 ? yProps-40 : yProps-20 }
            >
            { this.props.location }
          </text>
        </g>
      )
    }
  });


//DataVisContainer smart comoponent, access to Redux store.
class DataVisContainer extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div> 
        <Chart width={1000} height={500}>
          <Bar data={this.props.dataVisual} width={1000} height={500} />
        </Chart>
      </div> 
    )
  }
}
//Access the state
function mapStateToProps({dataVisual}) {
  return {dataVisual};
};
//Convert DataViseContainer into an smart component
export default connect(mapStateToProps, null)(DataVisContainer);