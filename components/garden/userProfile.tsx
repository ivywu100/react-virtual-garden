import { useUser } from "@/app/hooks/contexts/UserContext";
import { useState } from "react";
import colors from "../colors/colors";
import GardenDebugOptions from "../developer/GardenDebugOptions";
import LevelSystemComponent from "../level/LevelSystem";
import IconDisplay from "../user/icon/IconDisplay";

const UserProfileComponent = () => {
	const { user } = useUser();

	const [showDebugOptions, setShowDebugOptions] = useState(0);

	const getUsernameFontSize = () => {
		if (user.getUsername().length > 20) {
			return 'text-base';
		} else if (user.getUsername().length > 16) {
			return 'text-lg';
		} else if (user.getUsername().length > 12) {
			return 'text-xl';
		} else if (user.getUsername().length > 8) {
			return 'text-2xl';
		}
		return 'text-3xl';
	}

	const handleDebugOptionEnable = () => {
		if (process.env.NEXT_PUBLIC_DEVELOPER_OPTIONS === "true") {
			setShowDebugOptions((showDebugOptions) => showDebugOptions + 1);
		}
	}

	return <>
	<div className="flex flex-row items-center justify-center">
		<button onClick={handleDebugOptionEnable}>
			<IconDisplay icon={user.getIcon()} bgColor={`gray-300`} borderColor={`coffee-700`} textSize={"text-4xl"} elementSize={"12"}/>
		</button>
		<span className={`ml-4 ${getUsernameFontSize()} ${colors.user.usernameTextColor}`}>{user.getUsername()}</span>
	</div>
	<div className="mx-4 my-4"><LevelSystemComponent level={user.getLevel()} currentExp={user.getCurrentExp()} expToLevelUp={user.getExpToLevelUp()} /></div>
	<div className={`${showDebugOptions >= 3 ? `` : `hidden`}`}>
		<GardenDebugOptions/>
	</div>
	</>
}

export default UserProfileComponent;