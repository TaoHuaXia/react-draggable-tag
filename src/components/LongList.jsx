import React, {Component} from 'react'
import LongListItem from './LongListItem'
export default class LongList extends Component {
  constructor() {
    super()
    this.state = {
      val: ''
    }
  }

  onChange = (val) => {
    this.setState({
      val
    })
  }

  namedFunc = () => {
    console.log(11111)
  }

  render() {
    const data = new Array(1000).fill(1)
    return (
      <div className='module-wrapper'>
        <input value={this.state.val} onChange={e => this.onChange(e.target.value)}/>
        {
          data.map((item, index) => (
            <LongListItem
              key={index}
              data={item}
              unNamedFunc={() => console.log(2222)}
              namedFunc={this.namedFunc}
            />
          ))
        }
      </div>
    )
  }
}