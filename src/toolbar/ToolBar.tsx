import ToolIcon from "./toolIcon"

interface ToolBarProps{
    rectangle:() => void,
    circle: () => void,
    polygon: () => void,
    text: () => void
    selection: () => void,
    symbol: () => void,
    background: () => void,
    tool:string
}

const ToolBar = (props:ToolBarProps) => {
    

  return (
    <div id={"toolbar"}>
      <ToolIcon icon="ink_selection" tool="none" onClick={props.selection} selected={props.tool}/>
      <ToolIcon icon="rectangle" tool="rectangle" onClick={props.rectangle} selected={props.tool}/>
      <ToolIcon icon="pentagon" tool="polygon" onClick={props.polygon} selected={props.tool}/>
      <ToolIcon icon="circle" tool="circle" onClick={props.circle} selected={props.tool}/>
      <ToolIcon icon="text_fields" tool="text" onClick={props.text} selected={props.tool}/>
      <ToolIcon icon="emoji_symbols" tool="" onClick={props.symbol} selected={props.tool}/>
      <ToolIcon icon="texture" tool="" onClick={props.background} selected={props.tool}/>
    </div>
  )
}

export default ToolBar
