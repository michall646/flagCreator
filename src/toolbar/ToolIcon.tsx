import React from 'react'

interface toolIconProps{
    icon: string,
    tool: string,
    onClick: () => void,
    selected: string
}

const ToolIcon = (props: toolIconProps) => {

    const isSelected = props.tool === props.selected;
    const selectedClass = isSelected? "toolSelected" : "";
  return (
      <button
        className={"toolIcon " + selectedClass}
        onClick={props.onClick}
        ><span className="material-symbols-outlined">{props.icon}</span></button>
  )
}

export default ToolIcon
