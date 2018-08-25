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
      currentDraggingItem: null,
      currentPlaceZoneNextId: null
    }
    this.dragItems = {}
    this.dragItemWrapper = {}
    this.dragWrapper = null
    this.dragPosition = {
      top: null,
      left: null,
      prevX: null,
      prevY: null,
      offsetTop: null,
      offsetLeft: null
    }
    this.placeablePositions = []
    this.currentPlaceZoneNextId = null
    this.dragWrapperWidth = null
    this.insertIndex = null
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
    this.dragWrapperWidth = wrapperWidth
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
    let dragItemWrapper = this.dragItemWrapper[id]

    // 存储拖拽前的鼠标以及元素的位置信息
    this.dragPosition.prevX = e.nativeEvent.clientX
    this.dragPosition.prevY = e.nativeEvent.clientY
    this.dragPosition.left = 0
    this.dragPosition.top  = 0
    this.dragPosition.baseCenterY = dragItemWrapper.offsetTop + dragItem.offsetHeight / 2
    this.dragPosition.baseCenterX = dragItemWrapper.offsetLeft + dragItem.offsetWidth / 2
    // 获取被拖拽元素左侧的可放置区域的index，用以过滤其左右两侧的可放置区域
    let row = Math.floor(this.dragPosition.baseCenterY / this.props.rowHeight)
    let beforeZoneIndex = null
    this.placeablePositions[row].forEach((zone, index) => {
      if (zone.nextId === id) {
        beforeZoneIndex = index
      }
    })

    // 将被拖动元素的左右两侧的可放置区域过滤
    if (beforeZoneIndex !== null) {
      this.placeablePositions[row].splice(beforeZoneIndex, 2)
    }

    // 绑定mousemove事件以及mouseup事件
    let elementDrag = (e) => this.handleDrag(e, dragItem)
    document.addEventListener("mousemove", elementDrag, false)
    document.addEventListener("mouseup", _ => this.handleDragEnd(elementDrag))
  }

  handleDrag = (e, element) => {
    e.preventDefault()
    let currentClientX = e.clientX
    let currentClientY = e.clientY

    // 根据鼠标的位移来设置被拖动元素的transform的值
    let newElementLeft = this.dragPosition.left + currentClientX - this.dragPosition.prevX
    let newElementTop = this.dragPosition.top + currentClientY - this.dragPosition.prevY
    element.style.transform = `translate(${newElementLeft}px,${newElementTop}px)`

    // 更新位置对象的信息
    this.dragPosition.top = newElementTop
    this.dragPosition.left = newElementLeft
    this.dragPosition.prevY = currentClientY
    this.dragPosition.prevX = currentClientX

    // 根据当前拖动的元素的中心点来与可插入位置比对
    let currentMouseOffsetX = this.dragPosition.baseCenterX + newElementLeft
    let currentMouseOffsetY = this.dragPosition.baseCenterY + newElementTop

    // 根据当前拖动元素的中心点来判断拖动元素处于第几行
    // 并根据当前所处行数获取当前行的可放置区域的数组
    let row = Math.floor(currentMouseOffsetY / this.props.rowHeight)
    let placeableZones = [...this.placeablePositions[row]]
    console.log('row' + row)
    // 判断是否元素被移动到组件外，如果移动到组件外则不进行判断
    if (!placeableZones || currentMouseOffsetX > this.dragWrapperWidth) {
      console.log('出界拉')
      this.insertIndex = null
      return false
    }

    let isAlreadyHit = false

    for (let i = 0; i < placeableZones.length; i++) {

      // 遍历所有的可放置区域，根据区域的x,y的范围来判断是否命中
      let zone = placeableZones[i]
      let {xzone , yzone} = zone
      if (
        xzone[0] < currentMouseOffsetX && currentMouseOffsetX < xzone[1] &&
        yzone[0] < currentMouseOffsetY && currentMouseOffsetY < yzone[1]
      ) {
        console.log('找到了！！！')
        console.log(currentMouseOffsetX, currentMouseOffsetY)
        isAlreadyHit = true

        // 处理命中时nextId是null的情况，说明命中在尾部
        let nextId = zone.nextId || 'Trail'

        // 因为setState是异步的，所以在实例上声明一个变量以做判断
        if (this.currentPlaceZoneNextId !== nextId) {
          this.currentPlaceZoneNextId = nextId
          this.setState({
            currentPlaceZoneNextId: nextId
          })
        }

        // 如果已经命中，则可直接跳出循环
        break
      }
    }
    if (!isAlreadyHit) {
      console.log('出去啦！')
      console.log(currentMouseOffsetX, currentMouseOffsetY)
      // 如果遍历之后未命中，则重置currentPlaceZoneNextId
      if (this.currentPlaceZoneNextId !== null) {
        this.currentPlaceZoneNextId = null
        this.setState({
          currentPlaceZoneNextId: null
        })
      }
    }
  }

  handleDragEnd = (func) => {
    const { onChange } = this.props
    // 将挂载在document上的Mousemove事件，并将拖拽相关的信息重置
    document.removeEventListener("mousemove", func)

    // TODO 根据是否命中来调整tags的顺序
    let newTag = []
    onChange && onChange(newTag)

    // 重置拖拽相关的变量
    this.resetDragvariable()
  }

  resetDragvariable = () => {
    this.dragPosition = {
      top: null,
      left: null,
      prevX: null,
      prevY: null,
      offsetTop: null,
      offsetLeft: null
    }
    this.currentPlaceZoneNextId = null
    this.setState({
      currentDraggingItem: null,
      currentPlaceZoneNextId: null
    })
  }

  render() {
    const {tags, render, onChange, onDelete, wrapperClass, rowHeight} = this.props
    let itemHeight = rowHeight - 6
    return (
      <div className='DragWrapper' ref={ref => { this.dragWrapper = ref}}>
        {
          tags.map(item => {
            let isDragging = this.state.currentDraggingItem === item.id
            let isPlaceZoneNext = this.state.currentPlaceZoneNextId === item.id
            return (
              <div
                key={item.id}
                className={`DragItem ${wrapperClass || ''} ${isPlaceZoneNext ? 'indent' : ''}`}
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