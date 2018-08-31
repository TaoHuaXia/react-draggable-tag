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
      marginLeftId: null
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
    this.tagChanged = false
    this.dragDurationTimer = null
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
    this.setPositions(this.props)
  }

  componentWillReceiveProps(nextProps) {
    console.log('reciveProps')
    this.tagChanged = true
  }

  componentDidUpdate() {
    if (this.state.currentDraggingItem === null) {
      console.log('update')
      this.setPositions(this.props)
    }
  }

  setPositions = () => {
    this.placeablePositions = []
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
        let nextIndex = tagPosition.index
        let isRowTail = false
        if (row.length === 1) {
          // 区分当一行只有一个元素的情况
          xzone = [0, tagPosition.leftTop[0]]
          yzone = [tagPosition.leftTop[1], tagPosition.leftBottom[1]]

          // 初始化空数组
          this.placeablePositions[rowIndex] = []
          this.placeablePositions[rowIndex].push({
            nextId: null,
            nextIndex: null,
            isRowTail: true,
            xzone: [tagPosition.rightTop[0], wrapperWidth],
            yzone: [tagPosition.rightTop[1], tagPosition.rightBottom[1]]
          })
        } else if (tagIndex === 0) {
          // 区分元素为当前行首个元素的情况
          xzone = [0, tagPosition.leftTop[0]]
          yzone = [tagPosition.leftTop[1], tagPosition.leftBottom[1]]
        } else if (tagIndex === row.length - 1) {
          // 区分元素为当前行末尾元素的情况
          isRowTail = true
          // 如果在行末尾，nextId为下一行的首个元素
          let nextItem = itemPositionInRow[rowIndex + 1] && itemPositionInRow[rowIndex + 1][0]
          nextId = (nextItem && nextItem.id) || null
          nextIndex = (nextItem && nextItem.index)
          xzone = [tagPosition.rightTop[0], wrapperWidth]
          yzone = [tagPosition.rightTop[1], tagPosition.rightBottom[1]]

          // 如果在行末尾，需要额外插入一个最右侧的可放置区域，所以在此，现手动将末尾元素的左侧可放置区域push到数组中
          this.placeablePositions[rowIndex].push({
            nextId: tagPosition.id,
            nextIndex: tagPosition.index,
            isRowTail: false,
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
          nextIndex,
          xzone,
          yzone,
          isRowTail
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
    let event = e.nativeEvent
    if (this.props.clickable) {
      this.handleDurationDragStart(id, event)
    } else {
      this.handleDragStart(id, e)
    }

  }

  handleDurationDragStart = (id, event) => {
    let that = this
    let durationDragEnd = () => this.handleDragEnd(null, durationDragEnd)
    document.addEventListener("mouseup", durationDragEnd, false)
    let durationDragStart = () => {
      clearTimeout(this.dragDurationTimer)
      this.dragDurationTimer = null
      document.removeEventListener('mouseup', durationDragEnd)
      that.handleDragStart(id, event)
    }
    this.dragDurationTimer = setTimeout(durationDragStart, 500)
  }

  handleDragStart = (id, e) => {
    this.setState({
      currentDraggingItem: id
    })
    let dragItem = this.dragItems[id]
    let dragItemWrapper = this.dragItemWrapper[id]

    // 存储拖拽前的鼠标以及元素的位置信息
    this.dragPosition.prevX = e.clientX
    this.dragPosition.prevY = e.clientY
    this.dragPosition.left = dragItemWrapper.offsetLeft
    this.dragPosition.top = dragItemWrapper.offsetTop
    this.dragPosition.baseCenterY = dragItem.offsetHeight / 2
    this.dragPosition.baseCenterX = dragItem.offsetWidth / 2
    this.dragPosition.offsetLeft = dragItemWrapper.offsetLeft
    this.dragPosition.offsetTop = dragItemWrapper.offsetTop

    debugger
    console.log(dragItemWrapper, this.dragPosition)
    dragItem.style.position = 'absolute'
    dragItem.style.left = this.dragPosition.left + 'px'
    dragItem.style.top = this.dragPosition.top + 'px'

    // 获取被拖拽元素左侧的可放置区域的index，用以过滤其左右两侧的可放置区域
    let row = Math.floor((this.dragPosition.top + this.dragPosition.baseCenterY) / this.props.rowHeight)
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
    let handleDragEnd = () => this.handleDragEnd(elementDrag, handleDragEnd)
    document.addEventListener("mousemove", elementDrag, false)
    document.addEventListener("mouseup", handleDragEnd, false)
  }

  handleDrag = (e, element) => {
    e.preventDefault()
    let currentClientX = e.clientX
    let currentClientY = e.clientY

    // 根据鼠标的位移来设置被拖动元素的transform的值
    let newElementLeft = this.dragPosition.left + currentClientX - this.dragPosition.prevX
    let newElementTop = this.dragPosition.top + currentClientY - this.dragPosition.prevY
    element.style.left = newElementLeft + 'px'
    element.style.top = newElementTop + 'px'

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

    // 判断是否元素被移动到组件外，如果移动到组件外则不进行判断
    if (!this.placeablePositions[row] || currentMouseOffsetX > this.dragWrapperWidth) {
      console.log('出界拉')
      return false
    }

    let placeableZones = [...this.placeablePositions[row]]
    let zonesLength = placeableZones.length
    let isAlreadyHit = false

    for (let i = 0; i < zonesLength; i++) {

      // 遍历所有的可放置区域，根据区域的x,y的范围来判断是否命中
      let zone = placeableZones[i]
      let {xzone , yzone} = zone
      if (
        xzone[0] < currentMouseOffsetX && currentMouseOffsetX < xzone[1] &&
        yzone[0] < currentMouseOffsetY && currentMouseOffsetY < yzone[1]
      ) {
        console.log('找到了！！！')
        isAlreadyHit = true

        // 处理命中时nextId是null的情况，说明命中在尾部
        let nextId = zone.nextId || 'Trail'

        if (this.currentPlaceZoneNextId !== nextId) {
          this.currentPlaceZoneNextId = nextId
          
          // 当移动到行末尾时，不对右侧的元素进行后移
          if (!zone.isRowTail) {
            this.setState({
              marginLeftId: nextId
            })
          }
        }

        // 如果已经命中，则可直接跳出循环
        break
      }
    }
    if (!isAlreadyHit) {
      console.log('出去啦！')
      // 如果遍历之后未命中，则重置currentPlaceZoneNextId
      if (this.currentPlaceZoneNextId !== null) {
        this.currentPlaceZoneNextId = null
        this.setState({
          marginLeftId: null
        })
      }
    }
  }

  handleDragEnd = (moveFunc, upFunc) => {
    // 将挂载在document上的Mousemove事件，并将拖拽相关的信息重置
    moveFunc && document.removeEventListener("mousemove", moveFunc)
    document.removeEventListener("mouseup", upFunc)

    if (this.dragDurationTimer) {
      clearTimeout(this.dragDurationTimer)
      this.resetDragVariable()
      return false
    }

    const { onChange } = this.props

    let dragItem = this.dragItems[this.state.currentDraggingItem]
    dragItem.style.position = 'static'
    dragItem.style.left = this.dragPosition.offsetLeft + 'px'
    dragItem.style.top = this.dragPosition.offsetTop + 'px'

    if (this.currentPlaceZoneNextId !== null) {
      let draggingTag = null
      let newTag = [...this.props.tags]
      // 获取被拖动的元素对应的配置对象
      for (let i = 0; i < newTag.length; i++) {
        if (newTag[i].id === this.state.currentDraggingItem) {
          draggingTag = newTag.splice(i, 1)[0]
          break
        }
      }
      if (this.currentPlaceZoneNextId === 'Trail') {
        // 处理移动的位置为列表末尾的情况
        newTag.push(draggingTag)
      } else {
        for (let i = 0; i < newTag.length; i++) {
          if (newTag[i].id === this.currentPlaceZoneNextId) {
            newTag.splice(i, 0, draggingTag)
            break
          }
        }
      }
      console.log(2222222222)
      console.log(newTag)
      onChange && onChange(newTag)
    }
    // 重置拖拽相关的变量
    this.resetDragVariable()
  }

  resetDragVariable = () => {
    this.dragPosition = {
      top: null,
      left: null,
      prevX: null,
      prevY: null,
      offsetTop: null,
      offsetLeft: null
    }
    this.currentPlaceZoneNextId = null
    this.dragDurationTimer = null
    this.setState({
      currentDraggingItem: null,
      marginLeftId: null
    })
  }

  render() {
    const {tags, render, wrapperClass, rowHeight, clickable} = this.props
    let itemHeight = rowHeight - 6
    return (
      <div className='DragWrapper' ref={ref => { this.dragWrapper = ref}}>
        {
          tags.map(item => {
            let isDragging = this.state.currentDraggingItem === item.id
            let isPlaceZoneNext = this.state.marginLeftId === item.id
            return (
              <div
                key={item.id}
                className={`DragItem${isPlaceZoneNext ? ' indent' : ''}${!item.static && !clickable ? ' draggable' : ''}`}
                onMouseDown={item.static ? undefined : e => this.handleMouseDown(item.id, e)}
                ref={ref => { this.dragItemWrapper[item.id] = ref}}
              >
                <div
                  id={item.id}
                  className={`DragTag ${isDragging ? 'isDragging' : ''}`}
                  ref={ref => { this.dragItems[item.id] = ref}}
                  style={{height: itemHeight + 'px', lineHeight: itemHeight - 2 + 'px'}}
                >
                  {render(item)}
                </div>
                {
                  isDragging ?  <div
                    id={item.id}
                    className={'DragTag FlagTag'}
                    style={{height: itemHeight + 'px', lineHeight: itemHeight - 2 + 'px'}}
                  >
                    {render(item)}
                  </div> : null
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}