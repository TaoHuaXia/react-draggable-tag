import React from 'react'

export default class Fragment extends React.Component {
  render() {
    return (
        <React.Fragment>
          <h5>这是一个标题</h5>
          <p>这是一段内容</p>
        </React.Fragment>
    )
    // return [
    //   <h5>这是一个标题</h5>,
    //   <p>这是一段内容</p>
    // ]
  }
}