import { useAccount } from "@/app/hooks/contexts/AccountContext";
import { useAuth } from "@/app/hooks/contexts/AuthContext";
import { useGarden } from "@/app/hooks/contexts/GardenContext";
import { useInventory } from "@/app/hooks/contexts/InventoryContext";
import { useStore } from "@/app/hooks/contexts/StoreContext";
import { useUser } from "@/app/hooks/contexts/UserContext";
import { useRouter } from "next/navigation";

const ProfileMenu = ({isOpen, toggleMenu, menuRef}: {isOpen: boolean, toggleMenu: () => void, menuRef: React.RefObject<HTMLDivElement>}) => {
	const { firebaseUser, logout } = useAuth();
	const { guestMode } = useAccount();
    const { user, resetUser } = useUser();
    const { resetInventory } = useInventory();
    const { resetStore } = useStore();
    const { resetGarden } = useGarden();
	const router = useRouter();

	if (!firebaseUser && !guestMode) {
		return <></>;
	}

	const testClick = () => console.log('test');
	const handleLogout = () => {
		logout();
		toggleMenu();
	}
	const getLogoutButtonText = () => {
		if (firebaseUser) return "Sign Out";
		return "Error";
	}
	const getResetButtonText = () => {
		if (guestMode) return "Reset Saved Data";
		return "Error";
	}
	const handleReset = () => {
		resetUser();
        resetGarden();
        resetStore();
        resetInventory();
		window.location.reload();
	}

	return <>
		{isOpen && (
			<div ref={menuRef} className="absolute right-0 top-[70px] mr-2 bg-[#e0dedc] text-black rounded-lg shadow-lg p-2 w-max">
				<div className="block w-full text-left text-xl py-2 px-4 whitespace-nowrap">{user.getUsername()}</div>
				{/* <button onClick={testClick} className="block w-full text-left py-2 px-4 hover:bg-[#d0cecc] whitespace-nowrap">Manage Account</button> */}
				{ (guestMode && !firebaseUser &&
					<button onClick={handleReset} className="block w-full text-left py-2 px-4 hover:bg-[#d0cecc] whitespace-nowrap">{getResetButtonText()}</button>
				)
				}
				{ (firebaseUser && !guestMode &&
					<button onClick={handleLogout} className="block w-full text-left py-2 px-4 hover:bg-[#d0cecc] whitespace-nowrap">{getLogoutButtonText()}</button>
				)
				}
				</div>
		)}
	</>
}

export default ProfileMenu;