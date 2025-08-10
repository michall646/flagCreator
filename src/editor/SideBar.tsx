
import { Colorful, type ColorResult } from "@uiw/react-color"
import type { Shape } from "./ShapeType";

interface SideBarProps{
    selectedIds: string[],
    setSelectedIds: (ids:string[])=> void,

    shape: Shape | undefined
    setColor: (color:ColorResult)=> void,
    setFont: (font: string) => void,
    setSides: (value:number) => void,
    setValue: (value: string) => void,
    setCorners : (value: number) => void,
    setSize: (size: number) => void,

    moveUp : () => void,
    moveDown : () => void,
    moveTop : () => void,
    moveBottom : () => void,
    handleFillTypeChange: (value: "linear"|"radial"|"solid") => void,
    showSideBar: boolean,

    setX : (x:number) => void,
    setY : (y:number) => void,
    setWidth : (width: number) => void,
    setHeight : (height: number) => void
}


const SideBar = (props: SideBarProps) => {
    if(!props.showSideBar || !props.shape){
      return <></>
    }
    console.log(props)
  return (
    <div id="sidebar">
      <h3>Fill</h3>
      <select onChange={(e) => props.handleFillTypeChange(e.target.value)}>
        <option value={"solid"}>solid</option>
        <option value={"linear"}>linear gradient</option>
        <option value={"radial"}>radial gradient</option>
      </select>
      <Colorful
        color={props.shape.fill}
        onChange={props.setColor}
      />
      <div id="cords-container">
        <div className="input-container">
          <span>x</span>
          <input type="number" value={Math.round(props.shape.x * 10) /10  || 0} onChange={(e) =>props.setX(Number(e.target.value))}/>
        </div>
        <div className="input-container">
          <span>y</span>
          <input type="number" value={Math.round(props.shape.y * 10) /10 || 0} onChange={(e) =>props.setY(Number(e.target.value))}/>
        </div>
        <div className="input-container">
          <span>width</span>
          <input type="number" value={Math.round(props.shape.width * 10) /10  || 0} onChange={(e) =>props.setWidth(Number(e.target.value))}/>
        </div>
        <div className="input-container">
          <span>height</span>
          <input type="number" value={Math.round(props.shape.height * 10) /10  || 0} onChange={(e) =>props.setHeight(Number(e.target.value))}/>
        </div>
      </div>
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
        value={props.shape.corners || 0}
        onChange={(e) =>props.setCorners(Number(e.target.value))}
      />
      <hr></hr>
      {props.shape.sides !== -1 &&
      <>
        <h3>Sides</h3>
        <input
          type="range"
          min="3"
          max="12"
          value={props.shape.sides}
          onChange={(e) =>props.setSides(Number(e.target.value))}
        />
      </>
      }
      {typeof props.shape.value !== "undefined" &&
      <>
        <h3>Value</h3>
        <input
          value={props.shape.value}
          onChange={(e) =>props.setValue(e.target.value)}
        />
      </>
      }
      {typeof props.shape.font !== "undefined" &&
      <>
        <h3>Font</h3>
        <select onChange={(e) => props.setFont(e.target.value)}>
          <option value={"Arial"}>Arial</option>
          <option value={"Bebas Neue"}>Bebas Neue</option>
          <option value={"UnifrakturMaguntia"}>UnifrakturMaguntia</option>
        </select>
      </>
      }
      {typeof props.shape.size !== "undefined" &&
      <>
        <h3>Font Size</h3>
        <input
          type="range"
          min="5"
          max="300"
          value={props.shape.size}
          onChange={(e) =>props.setSize(Number(e.target.value))}
        />
      </>
      }
      
    </div>
  )
}

export default SideBar
