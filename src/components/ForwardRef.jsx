import React, {Component} from 'react'
class ForwardRef extends Component {
  render() {
    return (
      <div className='module-wrapper'>
        <input ref={this.props.forwardRef} />
      </div>
    )
  }
}

export default React.forwardRef((props, ref) => (
  <ForwardRef {...props} forwardRef={ref} />
))