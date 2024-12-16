'use client'
import PlusSquareFilled from "@/components/icons/buttons/plus-square-filled";
import { Inventory } from "@/models/itemStore/inventory/Inventory";
import { Store } from "@/models/itemStore/store/Store";
import { useCallback, useEffect, useState } from "react";
import MinusSquareFilled from "@/components/icons/buttons/minus-square-filled";
import TradeWindowItemComponent from "./tradeWindowItem";
import { saveStore } from "@/utils/localStorage/store";
import TrashCanFilled from "@/components/icons/buttons/trash-can-filled";
import ChangeQuantityButton from "../changeQuantityButton";
import { useStore } from "@/app/hooks/contexts/StoreContext";
import { useInventory } from "@/app/hooks/contexts/InventoryContext";
import { useSelectedItem } from "@/app/hooks/contexts/SelectedItemContext";
import { buyItemAPI, buyItemLocal, sellItemAPI, sellItemLocal, syncStoreAndInventory } from "./tradeWindowFunctions";
import { useUser } from "@/app/hooks/contexts/UserContext";
import { useAccount } from "@/app/hooks/contexts/AccountContext";
import { useDispatch } from "react-redux";
import { setItemQuantity } from "@/store/slices/inventoryItemSlice";


const TradeWindowComponent = ({costMultiplier, forceRefreshKey, setForceRefreshKey}: {costMultiplier: number, forceRefreshKey: number, setForceRefreshKey: React.Dispatch<React.SetStateAction<number>>}) => {
	const { inventory, reloadInventory } = useInventory();
    const { selectedItem, toggleSelectedItem, owner } = useSelectedItem();
	const defaultTradeWindowMessage = 'Trade Window';
	const [quantity, setQuantity] = useState(1);
	const [tradeWindowMessage, setTradeWindowMessage] = useState(defaultTradeWindowMessage);
	const { store, updateRestockTimer, reloadStore } = useStore();
	const { user } = useUser();
	const { account, guestMode } = useAccount();
	const dispatch = useDispatch();

	const resetSelected = () => {
		setTradeWindowMessage(defaultTradeWindowMessage);
		toggleSelectedItem(null);
	}

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

	useEffect(() => {
		if (!selectedItem) return;
		if (quantity > selectedItem.getQuantity()) {
		  setQuantity(selectedItem.getQuantity());
		} else if (quantity <= 0 && selectedItem.getQuantity() > 0) {
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

	const onConfirmClick = async () => {
		if (!selectedItem) return;
		if (owner instanceof Store) {
			if (!store.canBuyItem(selectedItem, quantity, inventory)) {
				setTradeWindowMessage(`Not enough gold for purchase!`);
				return;
			}
			const localResult = buyItemLocal(store, selectedItem, quantity, inventory);
			const updatedItem = inventory.getItem(selectedItem.itemData);
			if (localResult && updatedItem.isSuccessful()) {
				setTradeWindowMessage('Purchase Successful!');
				toggleSelectedItem(null);
				
				// Update redux store
				dispatch(setItemQuantity({ 
					inventoryItemId: selectedItem.getInventoryItemId(), 
					quantity: selectedItem.getQuantity()
				}));
				dispatch(setItemQuantity({ 
					inventoryItemId: updatedItem.payload.getInventoryItemId(), 
					quantity: updatedItem.payload.getQuantity()
				}));

				// Terminate early before api call
				if (guestMode) {
					updateRestockTimer();
					saveStore(store);
					return;
				}

				const apiResult = await buyItemAPI(user, store, selectedItem, quantity, inventory);
				if (!apiResult) {
					syncStoreAndInventory(user, store, inventory);
					reloadStore();
					reloadInventory();
					// TODO: force a refresh
					setTradeWindowMessage(`There was an error purchasing the item! Please refresh the page!`);
					setForceRefreshKey((forceRefreshKey) => forceRefreshKey + 1);
					// return;
				}
			} else {
				// TODO: Better error message
				setTradeWindowMessage('There was an error purchasing the item.');
			}
		} else if (owner instanceof Inventory) {
			const localResult = sellItemLocal(store, selectedItem, quantity, inventory);
			const updatedItem = store.getItem(selectedItem.itemData);
			if (localResult && updatedItem.isSuccessful()) {
				setTradeWindowMessage('Sale Successful!');
				toggleSelectedItem(null);
				
				// Update redux store
				dispatch(setItemQuantity({ 
					inventoryItemId: selectedItem.getInventoryItemId(), 
					quantity: selectedItem.getQuantity()
				}));
				dispatch(setItemQuantity({ 
					inventoryItemId: updatedItem.payload.getInventoryItemId(), 
					quantity: updatedItem.payload.getQuantity()
				}));

				// Terminate early before api call
				if (guestMode) {
					updateRestockTimer();
					saveStore(store);
					return;
				}

				const apiResult = await sellItemAPI(user, store, selectedItem, quantity, inventory);
				if (!apiResult) {
					syncStoreAndInventory(user, store, inventory);
					reloadStore();
					reloadInventory();
					setTradeWindowMessage(`There was an error selling the item! Please refresh the page!`);
					setForceRefreshKey((forceRefreshKey) => forceRefreshKey + 1);
					// return;
				}
			} else {
				// TODO: Better error message
				setTradeWindowMessage('There was an error selling the item.');
			}
		} else {
			//owner == null, should never occur
			return;
		}
		updateRestockTimer();
		saveStore(store);
	}

	const renderQuantityButtons = () => {
		return (
			<div className={`flex flex-row justify-between my-1 max-w-[90%] ${!selectedItem ? 'hidden' : ''}`}>
				<ChangeQuantityButton 
					onClick={onAllClick} 
					currentQuantity={quantity} 
					className={"bg-gray-300 rounded w-12 h-12 font-bold text-center text-purple-600 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"} 
					contents={<div data-testid="select-all">All</div>}
				/>
				<ChangeQuantityButton 
					onClick={onPlusClick} 
					currentQuantity={quantity} 
					className={"bg-gray-300 rounded w-12 h-12 text-center text-green-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"} 
					contents={<div data-testid="add-item"><PlusSquareFilled/></div>}
				/>
				<ChangeQuantityButton 
					onClick={onMinusClick} 
					currentQuantity={quantity} 
					className={"bg-gray-300 rounded w-12 h-12 text-center text-red-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"} 
					contents={<div data-testid="minus-item"><MinusSquareFilled/></div>}
				/>
				<button 
					onClick={onConfirmClick} 
					className="bg-gray-300 rounded h-12 px-2 text-center text-sm text-purple-600 font-semibold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2" 
					data-testid="confirm-transaction"
				>
					Confirm Transaction
				</button>
			</div>
		);
	}
	
	return (<>
		<div className={`my-8`} key={forceRefreshKey}>
			<div>{tradeWindowMessage}</div>
			<div className="w-full">
			{renderInventoryItem()}
			{renderQuantityButtons()}
			</div>
		</div>
	</>);
}

export default TradeWindowComponent;
