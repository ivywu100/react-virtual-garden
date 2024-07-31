import { useInventory } from "@/hooks/contexts/InventoryContext";
import { Inventory } from "@/models/itemStore/inventory/Inventory";
import InventoryItemComponent from "./inventoryItem";

const InventoryComponent = ({onInventoryItemClickFunction, costMultiplier}: {onInventoryItemClickFunction: (arg: any) => void, costMultiplier: number}) => {
	const { inventory } = useInventory();
	return (
		<>
		<div className="w-[80%]">
			<div>{inventory.getUserId()}'s Inventory</div>
			<div>Gold: {inventory.getGold()}</div>
			{inventory.getAllItems().map((item, itemIndex) => (
				<div key={itemIndex}>
					<InventoryItemComponent item={item} onClickFunction={onInventoryItemClickFunction} costMultiplier={costMultiplier}></InventoryItemComponent>
				</div>
			))}
		</div>
		</>
	);
}

export default InventoryComponent;