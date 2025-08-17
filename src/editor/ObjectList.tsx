import { useState } from "react";
import 'react-edit-text/dist/index.css';
import ShapeTile from "./ShapeTile";


interface shape{
    id: string, // Unique ID for each rectangle
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    rotation: number,
    type: string,
    name: string,
    
}
interface listProps {
  shapes : shape[];
  setShapes: any,
  selected: string[],
  setSelected: any;
  export: () => void,
  import: () => void,
}
const ObjectList = (props: listProps) => {

  const [editingId, setEditingId] = useState<string>("");

  const handleInputChange = (id: string, value: string) => {
    console.log(id, value);
    let temp = props.shapes.slice();
    temp = temp.map(item => {
      if(item.id === id){
         return {...item, name: value}
        }
      return item
    })
    console.log(temp)
    props.setShapes(temp);
  }
  const handleSelected = (id: string, meta: boolean) => {
    if(meta){
      const temp = props.selected.slice();
      if(temp.includes(id)){
        const index = temp.indexOf(id);
        temp.splice(index, 1);
      }else{
        temp.push(id)
      }
      props.setSelected(temp)
    }else{
      props.setSelected([id])
    }
  }
  const renderItem = (item: shape, index: number) => {
    return <ShapeTile selected={props.selected} handleSelected={handleSelected} editingId={editingId} setEditingId={setEditingId} index={index} key={index} shape={item} change={handleInputChange}/>
  }

  return (
    <div id="objectList">
      <button id="importButton" onClick={() => props.import()}>Import</button>
      <button id="exportButton" onClick={props.export}>Export</button>
      <h3>Objects</h3>
      {props.shapes.map(renderItem)}
    </div>
  )
}

export default ObjectList
