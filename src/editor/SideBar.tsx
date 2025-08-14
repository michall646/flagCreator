
import { Colorful, type ColorResult } from "@uiw/react-color"
import type { Shape } from "./ShapeType";
import Select from 'react-select'

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
    setAlign: (mode: string) => void,
    setStrokeColor: (color:ColorResult) => void,
    setStrokeWidth: (width: number) => void,

    moveUp : () => void,
    moveDown : () => void,
    moveTop : () => void,
    moveBottom : () => void,
    handleFillTypeChange: (value: "linear"|"radial"|"solid") => void,
    showSideBar: boolean,

    setX : (x:number) => void,
    setY : (y:number) => void,
    setWidth : (width: number) => void,
    setHeight : (height: number) => void,
    
}


const SideBar = (props: SideBarProps) => {
    if(!props.showSideBar || !props.shape){
      return <></>
    }
    const fillOptions = [
      { value: 'solid', label: 'solid' },
      { value: 'linear', label: 'linear gradient' },
    ]
    const fontOptions = [
      { value: 'Arial', label: 'Arial' },
      { value: 'Bebas Neue', label: 'Bebas Neue' },
      { value: 'UnifrakturMaguntia', label: 'UnifrakturMaguntia' },
      { value: 'Alegreya Sans', label: 'Alegreya Sans' },
      { value: 'Limelight', label: 'Limelight' },
      { value: 'Monoton', label: 'Monoton' },
      { value: 'Tiny5', label: 'Tiny5' },
      { value: 'Jacquard 12', label: 'Jacquard 12' },
      { value: 'Foldit', label: 'Foldit' },
      { value: 'Protest Guerrilla', label: 'Protest Guerrilla' },
      { value: 'Caesar Dressing', label: 'Caesar Dressing' },

    ]
    const alignOptions = [
      {value: 'center', label: 'center'},
      {value: 'left', label: 'left'},
      {value: 'right', label: 'right'},
    ]
  return (
    <div className="sidebox" id="sidebar">
      <h3>Fill</h3>
      <Select options={fillOptions} onChange={(x) => props.handleFillTypeChange(x.value)} unstyled classNamePrefix="sel" className="react-select-container"/>
      <Colorful
        color={props.shape.fill}
        onChange={props.setColor}
      />
      <h3>Stroke</h3>
      width
      <input
        type="range"
        min="0"
        max="20"
        value={props.shape.strokeWidth || 0}
        onChange={(e) =>props.setStrokeWidth(Number(e.target.value))}
      />
      color
      <Colorful
        color={props.shape.strokeColor}
        onChange={props.setStrokeColor}
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
        <button onClick={props.moveUp}><span style={{color: 'black'}} className="material-symbols-outlined">move_up</span></button>
        <button onClick={props.moveDown}><span style={{color: 'black'}} className="material-symbols-outlined">move_down</span></button>
        <button onClick={props.moveTop}><span style={{color: 'black'}} className="material-symbols-outlined">vertical_align_top</span></button>
        <button onClick={props.moveBottom}><span style={{color: 'black'}} className="material-symbols-outlined">vertical_align_bottom</span></button>
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
          <h3>Font</h3>
          <Select options={fontOptions}  onChange={(e) => props.setFont(e.value)} unstyled classNamePrefix="sel" className="react-select-container" styles={{
            option: (base, state) => ({
              ...base,
              fontFamily:state.label
            })
          }}/>
          <h3>Font Size</h3>
          <input
            type="range"
            min="5"
            max="300"
            value={props.shape.size}
            onChange={(e) =>props.setSize(Number(e.target.value))}
          />
          <h3>Align</h3>
          <Select options={alignOptions} onChange={(e) => props.setAlign(e.value)} unstyled classNamePrefix="sel" className="react-select-container"/>
        </>
      }
    </div>
  )
}

export default SideBar
