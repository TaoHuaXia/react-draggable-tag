import React, {Component} from 'react'

export default class FocusInput extends React.Component {
  constructor() {
    super()
    this.input = React.createRef()
  }

  getFocusAndChangeValue = () => {
    this.input.current.value = '获取到焦点啦'
    this.input.current.focus()
  }

  render() {
    return (
      <div className='module-wrapper'>
        <input ref={this.input} />
      </div>
    )
  }
}