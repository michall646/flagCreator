
interface ToolBarProps{
    rectangle:() => void,
    circle: () => void,
    polygon: () => void
    
}

const ToolBar = (props:ToolBarProps) => {
    

  return (
    <div style={{padding:"5px", margin: "5px", gap: "5px", backgroundColor: "#e4ebf7", borderRadius: "5px"}} id={"toolbar"}>
      <button
        onClick={props.rectangle}
        >Rectangle</button>
    <button
        onClick={props.polygon}
        >Polygon</button>
    <button
        onClick={props.circle}
        >Circle</button>
    </div>
  )
}

export default ToolBar
