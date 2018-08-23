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
    this.dragItemWrapper = {}
    this.dragWrapper = null
    this.dragPosition = {
      top: null,
      left: null,
      prevX: null,
      prevY: null
    }
    this.placeablePositions = []
  }

  static propTypes = {
    tags: PropTypes.array.isRequired,
    wrapperClass: PropTypes.string,
    render: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    rowHeight: PropTypes.number
  }

  static defaultProps = {
    rowHeight: 40
  }

  componentDidMount() {
    this.setPositions()
  }

  setPositions = () => {
    if (!this.props.tags) return false
    let wrapperWidth = this.dragWrapper.clientWidth
    let wrapperHeight = this.dragWrapper.clientHeight
    let itemPositionInRow = []
    this.props.tags.forEach((tag, index) => {
      let offsetTop = this.dragItemWrapper[tag.id].offsetTop
      let offsetLeft = this.dragItemWrapper[tag.id].offsetLeft
      let offsetHeight = this.dragItemWrapper[tag.id].offsetHeight
      let offsetWidth = this.dragItemWrapper[tag.id].offsetWidth

      // 根据offsetTop来计算出当前tag在第几行，对可放置区域根据行数来进行划分
      let row = Math.floor(offsetTop / this.props.rowHeight)
      if (!itemPositionInRow[row]) itemPositionInRow[row] = []
      itemPositionInRow[row].push({
        id: tag.id,
        index: index,
        leftTop: [offsetLeft, offsetTop],
        leftBottom: [offsetLeft, offsetTop + offsetHeight],
        rightTop: [offsetLeft + offsetWidth, offsetTop],
        rightBottom: [offsetLeft + offsetWidth, offsetTop + offsetHeight]
      })
    })
    itemPositionInRow.forEach((row, rowIndex) => {
      row.forEach((tagPosition, tagIndex) => {
        let xzone = []
        let yzone = []
        // 每一个标签前方的可放置区域的右侧就是当前标签（在鼠标移动到可放置区域的时候，右侧的标签应该后移）
        let nextId = tagPosition.id
        // (row[tagIndex + 1] && row[tagIndex + 1].id)  || null
        // 区分每行的首个跟最后一个元素
        if (tagIndex === 0) {
          xzone = [0, tagPosition.leftTop[0]]
          yzone = [tagPosition.leftTop[1], tagPosition.leftBottom[1]]
        } else if (tagIndex === row.length - 1) {
          // 如果在行末尾，nextId为下一行的首个元素
          nextId = (itemPositionInRow[rowIndex + 1] && itemPositionInRow[rowIndex + 1][0].id) || null
          xzone = [tagPosition.rightTop[0], wrapperWidth]
          yzone = [tagPosition.rightTop[1], tagPosition.rightBottom[1]]

          // 如果在行末尾，需要额外插入一个最右侧的可放置区域，所以在此，现手动将末尾元素的左侧可放置区域push到数组中
          this.placeablePositions[rowIndex].push({
            nextId: tagPosition.id,
            ...this.getZoneBetweenTwo(row[tagIndex - 1], tagPosition)
          })
        } else {
          let zoneGroup = this.getZoneBetweenTwo(row[tagIndex - 1], tagPosition)
          xzone = zoneGroup.xzone
          yzone = zoneGroup.yzone
        }
        if (!this.placeablePositions[rowIndex]) this.placeablePositions[rowIndex] = []
        this.placeablePositions[rowIndex].push({
          nextId,
          xzone,
          yzone
        })
      })
    })
    console.log(11111111111)
    console.log(this.placeablePositions)
  }

  getZoneBetweenTwo = (prev, current) => {
    let xzone = [prev.rightTop[0], current.leftTop[0]]
    let yzone = [current.leftTop[1], current.leftBottom[1]]
    return { xzone, yzone }
  }

  handleMouseDown = (id, e) => {
    e.preventDefault()
    this.setState({
      currentDraggingItem: id
    })
    let dragItem = this.dragItems[id]

    // 存储拖拽前的鼠标以及元素的位置信息
    this.dragPosition.prevX = e.nativeEvent.clientX
    this.dragPosition.prevY = e.nativeEvent.clientY
    this.dragPosition.left = 0
    this.dragPosition.top  = 0

    // 绑定mousemove事件以及mouseup事件
    let elementDrag = (e) => this.handleDrag(e, dragItem)
    document.addEventListener("mousemove", elementDrag, false)
    document.addEventListener("mouseup", _ => this.handleDragEnd(elementDrag))
  }

  handleDrag = (e, element) => {
    e.preventDefault()
    let currentClientX = e.clientX
    let currentClientY = e.clientY
    let newElementTop = this.dragPosition.top + currentClientX - this.dragPosition.prevX
    let newElementLeft = this.dragPosition.left + currentClientY - this.dragPosition.prevY
    console.log(newElementLeft, newElementTop)
    element.style.transform = `translate(${newElementTop}px,${newElementLeft}px)`
    this.dragPosition.top = newElementTop
    this.dragPosition.left = newElementLeft
    this.dragPosition.prevY = currentClientY
    this.dragPosition.prevX = currentClientX

    // TODO 根据移动的位置来判断插入的位置
  }

  handleDragEnd = (func) => {
    const { onChange } = this.props
    // 将挂载在document上的Mousemove事件，并将拖拽相关的信息重置
    document.removeEventListener("mousemove", func)
    this.dragPosition = {
      top: null,
      left: null,
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
    const {tags, render, onChange, onDelete, wrapperClass, rowHeight} = this.props
    let itemHeight = rowHeight - 6
    return (
      <div className='DragWrapper' ref={ref => { this.dragWrapper = ref}}>
        {
          tags.map(item => {
            let isDragging = this.state.currentDraggingItem === item.id
            return (
              <div
                key={item.id}
                className={`DragItem ${wrapperClass || ''}`}
                onMouseDown={e => this.handleMouseDown(item.id, e)}
                ref={ref => { this.dragItemWrapper[item.id] = ref}}
              >
                <div
                  id={item.id}
                  className={`DragTag ${isDragging ? 'isDragging' : ''}`}
                  ref={ref => { this.dragItems[item.id] = ref}}
                  style={{height: itemHeight + 'px'}}
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