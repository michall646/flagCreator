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
}


const SideBar = (props: SideBarProps) => {
    const [colorOpened, setColorOpened] = useState<boolean>(false);
    const [sidesSlider, setSidesSlider] = useState<number>(3);

    useEffect(() => {
      
    }, [props.selectedIds])
  return (
    <div>
      <h3>Color</h3>
      <Colorful
        color={props.color}
        onChange={props.setColor}
      />
      <h3>Order</h3>
    </div>
  )
}

export default SideBar
