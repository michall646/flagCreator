import { useState, useEffect } from "react"
import { Colorful, type ColorResult } from "@uiw/react-color"

interface SideBarProps{
    selectedIds: string[],
    setSelectedIds: (ids:string[])=> void,
    color: string,
    setColor: (color:ColorResult)=> void,
    moveUp : () => void,
    moveDown : () => void,
    moveTop : () => void,
    moveBottom : () => void,
    setCorners : (value: number) => void,
    corners: number,
    sides: number,
    setSides: (value:number) => void,
}


const SideBar = (props: SideBarProps) => {
    const [colorOpened, setColorOpened] = useState<boolean>(false);

    console.log(props.sides)
  return (
    <div id="sidebar">
      <h3>Fill</h3>
      <select>
        <option>plain</option>
        <option>linear gradient</option>
        <option>radial gradient</option>
      </select>
      <Colorful
        color={props.color}
        onChange={props.setColor}
      />
      <h3>Order</h3>
      <button onClick={props.moveUp}>Up</button>
      <button onClick={props.moveDown}>Down</button>
      <button onClick={props.moveTop}>Top</button>
      <button onClick={props.moveBottom}>Bottom</button>
      <hr></hr>
      <input
        type="range"
        min="0"
        max="100"
        value={props.corners}
        onChange={(e) =>props.setCorners(Number(e.target.value))}
      />
      <hr></hr>
      {props.sides !== -1 &&
        <input
        type="range"
        min="3"
        max="12"
        value={props.sides}
        onChange={(e) =>props.setSides(Number(e.target.value))}
      />}
      
    </div>
  )
}

export default SideBar
