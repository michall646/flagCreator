
import useImage from 'use-image';
import { Image } from 'react-konva';
import { useEffect } from 'react';



const SVG = (props: any) => {
    const [image] = useImage(
    `data:image/svg+xml;utf8,${encodeURIComponent(props.svg)}`
  );

    useEffect(() => {

    },[props.svgString])
  return (
    <Image
      image={image}
      x={props.x || 0}
      y={props.y || 0}
      width={props.width || (image ? image.width : 0)}
      height={props.height || (image ? image.height : 0)}
    />
  );
}

export default SVG
