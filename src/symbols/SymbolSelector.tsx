import { Path, Stage, Layer} from "react-konva"
import createSymbols from "./SymbolLibrary"

interface SelectorProps {
    spawnSvg : (path: string) => void,
}

const SymbolSelector = (props: SelectorProps) => {
    console.log
    return (
        <>
            <div id="symbolSelector" className="sidebox" >
                {createSymbols().map((s, i) => (
                     <div
                        key={i}
                        style={{width: 80, height: 80,}}
                        onClick={() =>{console.log(i, s.slice(0, 4)); props.spawnSvg(s)}}
                    >
                        <div className="symbol-preview">
                        <Stage width={80} height={80}>
                            <Layer> 
                                <Path
                                data={s}
                                width={80}
                                height={80}
                                scaleX={0.2667}
                                scaleY={0.2667}
                                fill='rgb(78, 124, 225)'
                                />
                            </Layer>
                        </Stage>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
export default SymbolSelector