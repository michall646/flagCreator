import { useState, useEffect } from "react"
import { Colorful, type ColorResult } from "@uiw/react-color"
import ReactSlider from 'react-slider'

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
    corners: number
}


const SideBar = (props: SideBarProps) => {
    const [colorOpened, setColorOpened] = useState<boolean>(false);
    const [sidesSlider, setSidesSlider] = useState<number>(3);

    useEffect(() => {
      
    }, [props.selectedIds])
  return (
    <div id="sidebar">
      <h3>Color</h3>
      <Colorful
        color={props.color}
        onChange={props.setColor}
      />
      <h3>Order</h3>
      <button onClick={props.moveUp}>Up</button>
      <button onClick={props.moveDown}>Down</button>
      <button onClick={props.moveTop}>Top</button>
      <button onClick={props.moveBottom}>Bottom</button>
      <input
        type="range"
        min="0"
        max="100"
        value={props.corners}
        onChange={(e) =>props.setCorners(Number(e.target.value))}
      />
    </div>
  )
}

export default SideBar
