import React, { useEffect } from 'react'
import { Path } from 'react-konva';

interface PathProps {
    data?: string,
    [key: string]: any;
}

const CustomPath = (props: PathProps) => {
    useEffect(() => {
        console.log(props.reference)
        props.reference?.cache();
    },[])

  return (
    <Path {...props}/>
  )
}

export default CustomPath
