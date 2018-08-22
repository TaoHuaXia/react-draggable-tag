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

    this.position.prevX = e.nativeEvent.clientX
    this.position.prevY = e.nativeEvent.clientY
    this.position.offsetTop = dragItem.offsetTop
    this.position.offsetLeft = dragItem.offsetLeft
    let elementDrag = (e) => this.handleDrag(e, dragItem)
    document.addEventListener("mousemove", elementDrag, false)
  }

  handleDrag = (e, element) => {
    e.preventDefault()
    let currentClientX = e.clientX
    let currentClientY = e.clientY
    let newElementTop = this.position.offsetTop + currentClientX - this.position.prevX
    let newElementLeft = this.position.offsetLeft + currentClientY - this.position.prevY
    element.style.transform = `translate(${newElementTop}px,${newElementLeft}px)`
    this.position.offsetTop = newElementTop
    this.position.offsetLeft = newElementLeft
    this.position.prevY = currentClientX
    this.position.prevX = currentClientY
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