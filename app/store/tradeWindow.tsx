'use client'
import PlusSquareFilled from "@/components/icons/buttons/plus-square-filled";
import { InventoryItem } from "@/models/items/inventoryItems/InventoryItem";
import { Inventory } from "@/models/itemStore/inventory/Inventory";
import { Store } from "@/models/itemStore/store/Store";
import { useCallback, useEffect, useState } from "react";
import MinusSquareFilled from "@/components/icons/buttons/minus-square-filled";
import TradeWindowItemComponent from "./tradeWindowItem";
import { saveStore } from "@/utils/localStorage/store";
import { saveInventory } from "@/utils/localStorage/inventory";
import TrashCanFilled from "@/components/icons/buttons/trash-can-filled";
import ChangeQuantityButton from "./changeQuantityButton";
import { useStore } from "@/hooks/contexts/StoreContext";
import { useInventory } from "@/hooks/contexts/InventoryContext";
import { useSelectedItem } from "@/hooks/contexts/SelectedItemContext";


const TradeWindowComponent = ({costMultiplier}: {costMultiplier: number}) => {
	const { inventory } = useInventory();
    const {selectedItem, toggleSelectedItem, owner, setOwner} = useSelectedItem();
	const defaultTradeWindowMessage = 'Trade Window';
	const resetSelected = () => {
		setTradeWindowMessage(defaultTradeWindowMessage);
		toggleSelectedItem(null);
	}
	const [quantity, setQuantity] = useState(1);
	const [tradeWindowMessage, setTradeWindowMessage] = useState(defaultTradeWindowMessage);
	
	const {store, restockStore, updateRestockTimer} = useStore();

	const renderInventoryItem = () => {
		if (selectedItem && owner != null) {
			let operationString = "";
			if (owner instanceof Store) {
				operationString = "Buying: ";
			} else if (owner instanceof Inventory) {
				operationString = "Selling: ";
			}
			return <>
					<div>
						<div>{operationString}</div>
						<div className="flex flex-row justify-center items-center">
							<TradeWindowItemComponent item={selectedItem} quantity={quantity} costMultiplier={costMultiplier}/>	
							<button className="ml-2 bg-gray-300 rounded w-7 h-7 text-center text-black hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2" onClick={resetSelected} data-testid="trash"><TrashCanFilled/></button>
						</div>
					</div>
				</>;
		} else {
			return <>
			<div>
				Select an item to buy or sell!
			</div>
			</>
		}
	}

	// //Resets quantity when selected changes
	// useEffect(() => {
	// 	setQuantity(1);
	// 	if (selectedItem != null) setTradeWindowMessage(defaultTradeWindowMessage);
	// }, [selectedItem]);
	
	// //Ensures quantity is never above/below bounds
	// useEffect(() => {
	// 	if (!selectedItem) return;
	// 	if (quantity > selectedItem.getQuantity()) {
	// 	  setQuantity(selectedItem.getQuantity());
	// 	}
	// 	if (quantity <= 0) {
	// 		setQuantity(1);
	// 	}
	//   }, [quantity, selectedItem]);

	useEffect(() => {
		if (!selectedItem) return;
		if (quantity > selectedItem.getQuantity()) {
		  setQuantity(selectedItem.getQuantity());
		}
		if (quantity <= 0) {
			setQuantity(1);
		}
	  }, [quantity, selectedItem]);


	useEffect(() => {
		setQuantity(1);
	  }, [selectedItem]);


	const onPlusClick = useCallback((delta: number) => {
		if (!selectedItem) return;
		setQuantity((quantity) => {
		  if (quantity + delta <= selectedItem.getQuantity()) {
			return quantity + delta;
		  }
		  return selectedItem.getQuantity();
		});
	  }, [selectedItem]);

	const onMinusClick = useCallback((delta: number) => {
		if (!selectedItem) return;
		setQuantity((quantity) => {
			if (quantity - delta > 0) {
			  return quantity - delta;
			}
			return 1;
		  });

	}, [selectedItem]);

	const onAllClick = useCallback(() => {
		if (!selectedItem || !owner) return;
		if (owner instanceof Store) {
			const maxBuy = Math.min(selectedItem.getQuantity(), Math.max(1, Math.floor(inventory.getGold()/(owner.getBuyPrice(selectedItem)))));
			setQuantity(maxBuy);
		} else if (owner instanceof Inventory) {
			setQuantity(selectedItem.getQuantity());
		} else {
			//should never occur
		}
	}, [selectedItem, inventory, owner]);

	const onConfirmClick = () => {
		if (!selectedItem) return;
		if (owner instanceof Store) {
			const response = store.buyItemFromStore(inventory, selectedItem, quantity);
			if (!response.isSuccessful()) {
				response.printErrorMessages();
				setTradeWindowMessage(response.messages[0]);
				return;
			}
			setTradeWindowMessage('Purchase Successful!');
			updateRestockTimer();
		} else if (owner instanceof Inventory) {
			const response = store.sellItemToStore(inventory, selectedItem, quantity);
			if (!response.isSuccessful()) {
				response.printErrorMessages();
				setTradeWindowMessage(response.messages[0]);
				return;
			}
			setTradeWindowMessage('Sale Successful!');
		} else {
			//owner == null, should never occur
			return;
		}
		saveStore(store);
		saveInventory(inventory);
		toggleSelectedItem(null);
	}

	const renderQuantityButtons = () => {
		if (selectedItem) {
			return <>
				<div className="flex flex-row justify-between my-1 max-w-[90%]">
					<ChangeQuantityButton onClick={onAllClick} currentQuantity={quantity} className={"bg-gray-300 rounded w-12 h-12 font-bold text-center text-purple-600 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"} contents={<div data-testid="select-all">All</div>}/>
					<ChangeQuantityButton onClick={onPlusClick} currentQuantity={quantity} className={"bg-gray-300 rounded w-12 h-12 text-center text-green-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"} contents={<div data-testid="add-item"><PlusSquareFilled/></div>}/>
					<ChangeQuantityButton onClick={onMinusClick} currentQuantity={quantity} className={"bg-gray-300 rounded w-12 h-12 text-center text-red-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"} contents={<div data-testid="minus-item"><MinusSquareFilled/></div>}/>
					<button onClick={onConfirmClick} className="bg-gray-300 rounded h-12 px-2 text-center text-sm text-purple-600 font-semibold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2" data-testid="confirm-transaction">Confirm Transaction</button>
				</div>
				</>
		} else {
			return <></>
		}
	}
	
	return (<>
		<div className={`my-8`}>
			<div>{tradeWindowMessage}</div>
			<div className="w-full">
			{renderInventoryItem()}
			{renderQuantityButtons()}
			</div>
		</div>
	</>);
}

export default TradeWindowComponent;