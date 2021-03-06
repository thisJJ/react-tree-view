import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  flattenDeep,
  get,
} from 'lodash'
import { fromJS } from 'immutable'

import TreeNodeCondition from './TreeNodeCondition'
import TreeNodeComponent from './TreeNodeComponent'

export default class TreeView extends Component {

  static propTypes = {
    labelStyle: PropTypes.string,
    treeStyle: PropTypes.string,
    data: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
    ]),
    childsIndex: PropTypes.array,
    onSelected: PropTypes.func,
    activeName: PropTypes.string,
    childName: PropTypes.string,
    labelName: PropTypes.string,
  }

  static defaultProps = {
    labelStyle: '',
    treeStyle: '',
    data: [],
    childsIndex: [],
    activeName: null,
    childName: 'childs',
    labelName: 'name',
  }

  constructor(props){
    super(props)
    this.state = {
      activeName: null,
      clickName: '',
      itemData: fromJS([])
    }
  }

  componentDidMount = () => {
    this.initialStateData()
  }

  componentWillReceiveProps = (nextProps) => {

    const {
      activeName,
      data,
    } = this.state

    if(nextProps.activeName !== activeName) {
      this.setState({
        activeName: nextProps.activeName,
      })
    }

    if(nextProps.data !== data) {
      this.setState({
        itemData: fromJS(nextProps.data),
      })
    }
  }

  initialStateData = () => {
    const {
      data,
      activeName,
    } = this.props
    this.setState({
      itemData: fromJS(data),
      activeName: activeName
    })
  }

  createNewData = (data, dataIndex, childName) => {
    let setData = data
    for(let i = 0; i < dataIndex.length; i++){
      if(i === 0){
        setData = setData[dataIndex[i]]
      }
      if(i > 0){
        setData = setData[`${childName}`][dataIndex[i]]
      }
    }
    return setData
  }

  createSourceTreeIndex = (getIndex, childName, state) => {
    const updateData = state.itemData
    const getData = updateData.toJS()
    const treeSourceKey = getIndex.reduce((pre, cur) => {
      const resultData  = get(getData, pre.currentKey ? `${pre.currentKey}${childName}[${cur}].name`: '' +  `[${cur}].name`, '')
      pre.result.push(resultData)
      pre.currentKey = pre.currentKey ? pre.currentKey + `${childName}[${cur}].` : `[${cur}].`
      return pre
    }, {
      result: [],
      currentKey: ''
    })
  
    return treeSourceKey
  }

  getTreeIndex = (index) => {
    const {
      onSelected,
      childName,
    } = this.props
    
    const getIndex = flattenDeep(index)
    const data = this.state.itemData.toJS()
    const setData = this.createNewData(data, getIndex, childName)
    const itemData = this.state.itemData
    
    const sourceTreeIndex = this.createSourceTreeIndex(getIndex, childName, this.state)

    this.setState({
      activeName: setData.name,
    })

    const currentKeyData = sourceTreeIndex.currentKey.slice(0, -1)
    onSelected(setData, getIndex, setData.name, itemData, sourceTreeIndex.result, currentKeyData)
  }

  render(){

    const {
      state: {
        itemData,
        activeName
      },
      getTreeIndex,
    } = this

    const {
      labelStyle,
      treeStyle,
      childsIndex,
      childName,
      labelName,
    } = this.props

    return(
      <div className="tree-view-component">
        <style jsx>
        {
         `
         .tree-view-component{
           position: relative;
           display: block;
           clear:  both;
         }
         ul.tree-view-body{
           display: block;
           list-style: none;
           padding: 0px;
           margin: 0px;
         }
         
         span.tree-view-node{
           position: relative;
           list-style: none;
           display: block;
           padding-top: 10px;
         }
         ${ treeStyle === '' ? `
           span.tree-view-node:first-child:before{
             content: '';
             width: 1px;
             height: 100%;
             position: absolute;
             left: -15px;
             top: 0px;
             background-color: #ddd;
           }
           span.tree-view-node:last-child:before{
             content: '';
             width: 1px;
             height: 0%;
             position: absolute;
             left: -15px;
             top: 0px;
             background-color: #ddd;
           }
           span.tree-view-node span{
             padding-top: 10px;
             margin-left: 30px;
             position: relative;
             list-style: none;
             display: block;
           }
         ` : treeStyle }
         ${labelStyle === '' ? `
           .tree-view-label{
             cursor: pointer;
             padding: 5px 15px;
             display: inline-block;
             position: relative;
             background-color: #eee;
           }
           .tree-view-label:hover{
             background: rgba(0,0,0,0.05);
           }
           .tree-view-label:before{
             content: '';
             width: 1px;
             height: 82%;
             position: absolute;
             left: -15px;
             top: -10px;
             background-color: #ddd;
           }
         
           .tree-view-label:after{
             content: '';
             width: 15px;
             height: 1px;
             position: absolute;
             left: -15px;
             top: 50%;
             background-color: #ddd;
           }
           .tree-view-label.active{
             background-color: #ddd;
             color: #333;
           }
           .tree-view-label.active:hover{
             background: #eee;
           }
           ` : labelStyle }
         `
        }
        </style>
        <ul className="tree-view-body">
          <TreeNodeComponent
            data={ itemData }
            childsIndex={ childsIndex }
            getTreeIndex={ getTreeIndex }
            activeName={ activeName }
            childName={ childName }
            labelName={ labelName }
          />
        </ul>
      </div>
    )
  }
}
