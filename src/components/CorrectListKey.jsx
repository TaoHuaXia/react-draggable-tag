import React, {Component} from 'react'

export default class CorrectListKey extends Component {
  constructor() {
    super()
    this.state = {
      data: [
        { id: 1, label: '输入框1'},
        { id: 2, label: '输入框2'},
        { id: 3, label: '输入框3'}
      ]
    }
  }

  handleAddItem = () => {
    let id = parseInt(Math.random() * 100 + 3)
    this.setState({
      data: [
        {
          id,
          label: `输入框${id}`
        },
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
        <h5>使用主键作为key</h5>
        <button onClick={this.handleAddItem}>添加一个节点</button>
        <button onClick={this.handleRemoveFirstItem}>删除第一个节点</button>
        <ul>
          {
            this.state.data.map((item) => {
              return (
                <li key={item.id}>
                  <span>{item.label}:</span>
                  <input />
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}