import { useUser } from "@/hooks/contexts/UserContext";
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
		setShowDebugOptions((showDebugOptions) => showDebugOptions + 1);
	}

	return <>
	<div className="flex flex-row items-center justify-center">
		<button onClick={handleDebugOptionEnable}>
			<IconDisplay icon={user.getIcon()} borderColor={`coffee-700`} size={"text-4xl"}/>
		</button>
		<span className={`ml-4 ${getUsernameFontSize()} ${colors.user.usernameTextColor}`}>{user.getUsername()}</span>
	</div>
	<div className="mx-4 my-4"><LevelSystemComponent level={user.getLevel()} currentExp={user.getCurrentExp()} expToLevelUp={user.getExpToLevelUp()} /></div>
	<div className={`${showDebugOptions >= 30 ? `` : `hidden`}`}>
		<GardenDebugOptions/>
	</div>
	</>
}

export default UserProfileComponent;