import React, {Component} from 'react'

// export default class LongListItem extends Component {
//
//   // shouldComponentUpdate(nextProps) {
//   //   console.log('匿名函数')
//   //   console.log(this.props.unNamedFunc === nextProps.unNamedFunc)
//   //   console.log('非匿名函数')
//   //   console.log(this.props.namedFunc === nextProps.namedFunc)
//   //   return true
//   // }
//
//   // shouldComponentUpdate(nextProps) {
//   //   if (this.props.data === nextProps.data) {
//   //     return false
//   //   }
//   //   return true
//   // }
//
//   render() {
//     console.log('itemRender')
//     return (
//       <p>%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%</p>
//     )
//   }
// }

export default class LongListItem extends React.PureComponent {

  render() {
    console.log('itemRender')
    return (
      <p>%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%</p>
    )
  }
}