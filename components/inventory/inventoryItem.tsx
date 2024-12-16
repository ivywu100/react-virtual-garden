"use client";
import { InventoryItem } from "@/models/items/inventoryItems/InventoryItem";
import { Inventory } from "@/models/itemStore/inventory/Inventory";
import { Store } from "@/models/itemStore/store/Store";
import { useSelector, useDispatch } from "react-redux";
import { setItemQuantity } from "@/store/slices/inventoryItemSlice";
import { AppDispatch, RootState } from "@/store";
import { useEffect, useState } from "react";
import colors from "../colors/colors";
import InventoryItemTooltip from "./inventoryItemTooltip";
import ItemComponent from "./item";

const InventoryItemComponent = ({itemStore, item, onClickFunction, costMultiplier, focus}: {itemStore: Store | Inventory, item: InventoryItem, onClickFunction: (arg: any) => void, costMultiplier: number, focus: boolean}) => {
	
	const dispatch: AppDispatch = useDispatch();

    // Get quantity from Redux state
    const quantity = useSelector(
        (state: RootState) => state.inventoryItems[item.getInventoryItemId()]?.quantity || item.getQuantity()
    );

    // Sync initial quantity to Redux when the component mounts
    useEffect(() => {
        dispatch(
            setItemQuantity({
                inventoryItemId: item.getInventoryItemId(),
                quantity: item.getQuantity(),
            })
        );
    }, [dispatch, item]);
	
	const handleClick = () => {
		onClickFunction(item);
	}

	const getTextColor = () => {
		if (itemStore instanceof Store) {
			return colors.store.storeDefaultItemTextColor;
		} else {
			//itemStore instanceof Inventory
			return colors.inventory.inventoryDefaultItemTextColor;
		}
	}

	const getPriceColor = () => {
		if (itemStore instanceof Store) {
			if (costMultiplier > 2) {
				return colors.store.storeHighPrice;
			} else if (costMultiplier == 2) {
				return colors.store.storeRegularPrice;
			} else if (costMultiplier < 2) {
				return colors.store.storeLowPrice;
			}
			return '';
		} else {
			//itemStore instanceof Inventory
			if (costMultiplier > 1) {
				return colors.inventory.inventoryHighPrice;
			} else if (costMultiplier == 1) {
				return colors.inventory.inventoryRegularPrice;
			} else if (costMultiplier < 1) {
				return colors.inventory.inventoryLowPrice;
			}
			return '';
		}
	}

	const getBorderColor = () => {
		if (focus) {
			return colors.inventory.inventoryItemBorderColor;
		} else {
			return `border-transparent`;
		}
	}

	return (
		<>
		<InventoryItemTooltip item={item}>
			<button onClick={handleClick} className={`${getTextColor()} flex justify-between bg-reno-sand-400 px-4 py-1 my-0.5 w-full text-sm font-semibold border ${getBorderColor()} border-4 hover:text-white hover:bg-purple-600 hover:border-transparent`}>
				<ItemComponent icon={item.itemData.icon} name={item.itemData.name} quantity={quantity} price={item.itemData.value * costMultiplier} priceColor={getPriceColor()} width={55}/>
			</button>
		</InventoryItemTooltip>
		</>
	);
}

export default InventoryItemComponent;