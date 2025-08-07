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
    handleFillTypeChange: (value: "linear"|"radial"|"solid") => void,
    showSideBar: boolean
}


const SideBar = (props: SideBarProps) => {
    const [colorOpened, setColorOpened] = useState<boolean>(false);

    console.log(props.sides)
    if(!props.showSideBar){
      return <></>
    }
  return (
    <div id="sidebar">
      <h3>Fill</h3>
      <select onChange={(e) => props.handleFillTypeChange(e.target.value)}>
        <option value={"solid"}>solid</option>
        <option value={"linear"}>linear gradient</option>
        <option value={"radial"}>radial gradient</option>
      </select>
      <Colorful
        color={props.color}
        onChange={props.setColor}
      />
      <h3>Order</h3>
      <div style={{display: "flex", flexDirection: "row"}}>
        <button onClick={props.moveUp}>Up</button>
        <button onClick={props.moveDown}>Down</button>
        <button onClick={props.moveTop}>Top</button>
        <button onClick={props.moveBottom}>Bottom</button>
      </div>
      <hr></hr>
      <h3>Corner Radius</h3>
      <input
        type="range"
        min="0"
        max="100"
        value={props.corners}
        onChange={(e) =>props.setCorners(Number(e.target.value))}
      />
      <hr></hr>
      {props.sides !== -1 &&
      <>
        <h3>Sides</h3>
        <input
          type="range"
          min="3"
          max="12"
          value={props.sides}
          onChange={(e) =>props.setSides(Number(e.target.value))}
        />
      </>
      }
      
    </div>
  )
}

export default SideBar
