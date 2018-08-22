import React from 'react'

// const StringFormat = () => {
//   return (
//     <div className='module-wrapper'>
//       <ul>
//         <li>
//           <div>Hello World</div>
//         </li>
//         <li>
//           <div>
//             Hello World
//           </div>
//         </li>
//         <li>
//           <div>
//             Hello
//             World
//           </div>
//         </li>
//         <li>
//           <div>
//
//             Hello           World
//           </div>
//         </li>
//       </ul>
//     </div>
//   )
// }
// export default StringFormat

export default class StringFormat extends React.Component {
  componentDidMount() {
    document.addEventListener('click', (e) => {
      console.log(e.currentTarget)
    })
  }
  parentClick = (e) => {
    console.log(e.currentTarget)
  }

  childClick = (e) => {
    console.log(e.currentTarget)
    e.stopPropagation()
  }
  render() {
    return (
      <div onClick={this.parentClick}>
        <button onClick={this.childClick}>点击发射</button>
      </div>
    )
  }
}

