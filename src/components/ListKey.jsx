import React, {Component} from 'react'

export default class ListKey extends Component {
  constructor() {
    super()
    this.state = {
      data: [
        '输入框1',
        '输入框2',
        '输入框3',
      ]
    }
  }

  handleAddItem = () => {
    this.setState({
      data: [
        `输入框${parseInt(Math.random() * 100 + 3)}`,
        ...this.state.data
      ]
    })
  }

  handleRemoveFirstItem = () => {
    let data = [...this.state.data]
    data.shift()
    this.setState({
      data
    })
  }

  render() {
    return (
      <div className='module-wrapper'>
        <h5>使用索引作为key</h5>
        <button onClick={this.handleAddItem}>添加一个节点</button>
        <button onClick={this.handleRemoveFirstItem}>删除第一个节点</button>
        <ul>
          {
            this.state.data.map((item, index) => {
              return (
                <li key={index}>
                  <span>{item}:</span>
                  <input/>
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}