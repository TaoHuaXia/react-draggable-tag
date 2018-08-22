import React, {Component} from 'react'
import ReactDOM from 'react-dom'
class Modal extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
    this.el.className = 'modal-wrapper'
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      document.body.appendChild(this.el);
    } else {
      document.body.removeChild(this.el);
    }
  }

  render() {
    if (!this.props.visible) {
      return null
    }
    return ReactDOM.createPortal(
      this.props.children,
      this.el,
    );
  }
}

export default class Content extends Component {
  constructor() {
    super()
    this.state = {
      visible: false
    }
  }
  handleClick = () => {
    console.log('触发父级组件的onClick')
  }
  showModal = (e) => {
    e.stopPropagation()
    this.setState({
      visible:  true
    })
  }
  closeModal = () => {
    this.setState({
      visible:  false
    })
  }
  render() {
    return (
      <div className='content-wrapper' onClick={this.handleClick}>
        <h5>这是标题</h5>
        <p>这是内容</p>
        <button onClick={this.showModal}>展示弹窗</button>
        <Modal visible={this.state.visible}>
          <h5>弹窗标题</h5>
          <p>弹窗内容</p>
          <button onClick={this.closeModal}>确定</button>
        </Modal>
      </div>
    )
  }
}