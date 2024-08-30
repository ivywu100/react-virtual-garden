import { MouseEventHandler } from "react";
import IconDisplay from "./IconDisplay";

const IconButton = ({icon, onClickFunction, borderColor, size}: {icon: string, onClickFunction: MouseEventHandler<HTMLButtonElement>, borderColor: string, size: string}) => {
	
	return (
	<button onClick={onClickFunction} className={`mx-2`}>
		<IconDisplay icon={icon} borderColor={borderColor} size={size}/>
	</button>
	);

}

export default IconButton;