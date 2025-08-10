
import { Text} from "react-konva"
interface TextProps{
    [key: string]: any; // for other Konva properties
}
const EditableText = (props: TextProps) => {
  


  return (
    <>
    <Text
    ref={props.ref}
    text={props.value}
    x={props.x}
    id={props.id}
    y={props.y}
    fill={props.fill}
    fontSize={props.fontSize}
    draggable
    fontFamily={props.font}
    width={props.width}
    onClick={props.onClick}
    onTransform={props.onTransformEnd}
    />
    </>
)
}





export default EditableText
