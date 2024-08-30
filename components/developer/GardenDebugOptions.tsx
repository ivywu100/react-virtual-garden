import { useGarden } from "@/hooks/contexts/GardenContext";
import { useInventory } from "@/hooks/contexts/InventoryContext";
import { useUser } from "@/hooks/contexts/UserContext";
import { placeholderItemTemplates } from "@/models/items/templates/models/PlaceholderItemTemplate";
import { saveInventory } from "@/utils/localStorage/inventory";
import { saveUser } from "@/utils/localStorage/user";

const GardenDebugOptions = () => {
	const { user, resetUser } = useUser();
	const { garden, resetGarden, updateGardenForceRefreshKey, toggleInstantGrow } = useGarden();
	const { inventory, resetInventory, updateInventoryForceRefreshKey } = useInventory();
	
	function addAppleSeed() {
		if (!inventory) return;
		const appleSeedTemplate = placeholderItemTemplates.getInventoryItemTemplateByName('apple seed');
		inventory.gainItem(appleSeedTemplate!, 10);
		updateInventoryForceRefreshKey();
		saveInventory(inventory);
	}

	function addGold() {
		if (!inventory) return;
		inventory.addGold(10000);
		updateInventoryForceRefreshKey();
		saveInventory(inventory);
	}

	function handleResetGarden() {
		if (!garden) return;
		resetGarden();
		updateGardenForceRefreshKey();
	}

	function levelUp() {
		if (!user) {
			return;
		}
		user.addExp(user.getExpToLevelUp());
		updateInventoryForceRefreshKey(); //why does this rerender user??
		saveUser(user);
	}

	return ( <>
		<div>
			<button onClick={toggleInstantGrow} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>toggle instant harvest mode (debug)</button>
		</div>
		<div>
			<button onClick={levelUp} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>levelup (debug)</button>
		</div>
		<div>
			<button onClick={addAppleSeed} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>gain apple seed (debug)</button>
		</div>
		<div>
			<button onClick={addGold} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>gain 10000 gold (debug)</button>
		</div>
		<div>
			<button onClick={resetInventory} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>reset inventory (debug)</button>
		</div>
		<div>
			<button onClick={handleResetGarden} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>reset garden (debug)</button>
		</div>
		<div>
			<button onClick={resetUser} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>reset user (debug)</button>
		</div>
		</>
	);
}

export default GardenDebugOptions;