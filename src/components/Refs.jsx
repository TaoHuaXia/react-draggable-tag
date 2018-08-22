import React, {Component} from 'react'
import FocusInput from './FocusInput'
import ForwardRef from './ForwardRef'
export default class Refs extends Component {
  constructor() {
    super()
    this.input = React.createRef()
    this.focusInput = React.createRef()
    this.forwardRef = React.createRef()
  }

  componentWillMount() {
    console.log('-----WillMount---')
    console.log(this.input)
  }

  componentDidMount() {
    console.log('-----DidMount---')
    console.log(this.input)
      this.input.current.value = '获取焦点'
    this.input.current.focus()
  }

  handleClick = () => {
    console.log('-----触发FocusInput实例方法---')
    console.log(this.focusInput)
    this.focusInput.current.getFocusAndChangeValue()
  }

  handleForwardClick = () => {
    console.log('-----打印forwardRef---')
    console.log(this.forwardRef)
  }

  render() {
    return (
      <div className='module-wrapper'>
        <button onClick={this.handleClick}>触发FocusInput实例方法</button>&emsp;
        <button onClick={this.handleForwardClick}>打印forwardRef</button>
        <h5>对DOM使用ref</h5>
        <input ref={this.input} />
        <h5>对组件类使用ref</h5>
        <FocusInput ref={this.focusInput} />
        <h5>对组件类使用forwardRef</h5>
        <ForwardRef ref={this.forwardRef} />
      </div>
    )
  }
}