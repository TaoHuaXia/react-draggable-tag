import React, {Component} from 'react'
import PropTypes from 'prop-types'
/**
*@param tags: Array[DragItem]
*@param wrapperClass: string
*@param render: func(tag):ReactElement
*@param onChange: func(tags):void
*@param onDelete: func(id, tag):void
**/
export default class DragWrapper extends Component {
  constructor() {
    super()
    this.state = {
      currentDraggingItem: null
    }
    this.dragItems = {}
    this.position = {
      offsetTop: null,
      offsetLeft: null,
      prevX: null,
      prevY: null
    }
  }

  static propTypes = {
    tags: PropTypes.array.isRequired,
    wrapperClass: PropTypes.string,
    render: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    onDelete: PropTypes.func
  }

  handleMouseDown = (id, e) => {
    e.preventDefault()
    this.setState({
      currentDraggingItem: id
    })
    let dragItem = this.dragItems[id]

    // 存储拖拽前的鼠标以及元素的位置信息
    this.position.prevX = e.nativeEvent.clientX
    this.position.prevY = e.nativeEvent.clientY
    this.position.left = 0
    this.position.top  = 0

    // 绑定mousemove事件以及mouseup事件
    let elementDrag = (e) => this.handleDrag(e, dragItem)
    document.addEventListener("mousemove", elementDrag, false)
    document.addEventListener("mouseup", _ => this.handleDragEnd(elementDrag))
  }

  handleDrag = (e, element) => {
    e.preventDefault()
    let currentClientX = e.clientX
    let currentClientY = e.clientY
    let newElementTop = this.position.top + currentClientX - this.position.prevX
    let newElementLeft = this.position.left + currentClientY - this.position.prevY
    console.log(newElementLeft, newElementTop)
    element.style.transform = `translate(${newElementTop}px,${newElementLeft}px)`
    this.position.top = newElementTop
    this.position.left = newElementLeft
    this.position.prevY = currentClientY
    this.position.prevX = currentClientX

    // TODO 根据移动的位置来判断插入的位置
  }

  handleDragEnd = (func) => {
    const { onChange } = this.props
    // 将挂载在document上的Mousemove事件，并将拖拽相关的信息重置
    document.removeEventListener("mousemove", func)
    this.position = {
      offsetTop: null,
      offsetLeft: null,
      prevX: null,
      prevY: null
    }
    this.setState({
      currentDraggingItem: null
    })

    // TODO 根据放置的位置来调整tags的顺序
    let newTag = []
    onChange && onChange(newTag)
  }


  render() {
    const {tags, render, onChange, onDelete, wrapperClass} = this.props
    return (
      <div className='DragWrapper'>
        {
          tags.map(item => {
            let isDragging = this.state.currentDraggingItem === item.id
            return (
              <div
                key={item.id}
                className={`DragItem ${wrapperClass || ''}`}
                onMouseDown={e => this.handleMouseDown(item.id, e)}
              >
                <div
                  id={item.id}
                  className={`DragTag ${isDragging ? 'isDragging' : ''}`}
                  ref={ref => { this.dragItems[item.id] = ref}}
                >
                  {render(item)}
                </div>
                {
                  isDragging ? <div className='TargetTag' /> : null
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}