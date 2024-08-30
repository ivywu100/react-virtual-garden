'use client'
import { StoreContext } from '@/hooks/contexts/StoreContext';
import { generateNewPlaceholderInventoryItem } from '@/models/items/PlaceholderItems';
import { InventoryTransactionResponse } from '@/models/itemStore/inventory/InventoryTransactionResponse';
import { ItemList } from '@/models/itemStore/ItemList';
import { stocklistRepository } from '@/models/itemStore/store/StocklistRepository';
import { Store } from '@/models/itemStore/store/Store';
import { storeRepository } from '@/models/itemStore/store/StoreRepository';
import { loadStore, saveStore } from '@/utils/localStorage/store';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

// Define props for the provider
interface StoreProviderProps {
    children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
    const [store, setStore] = useState<Store | null>(null);

	function generateInitialStore() {
		function generateItems() { 
			return stocklistRepository.getStocklistInterfaceById("0")?.items;
		}
		const storeId = 0;
		const storeName = "Default Store";
		const storeInterface = storeRepository.getStoreInterfaceById(0);
		let buyMultiplier = 2;
		let sellMultiplier = 1;
		let upgradeMultiplier = 1;
		let restockTime = Date.now();
		let restockInterval = 300000;
		if (storeInterface) {
			buyMultiplier = storeInterface.buyMultiplier;
			sellMultiplier = storeInterface.sellMultiplier;
			upgradeMultiplier = storeInterface.upgradeMultiplier;
			restockInterval = storeInterface.restockInterval;
		}
		const initialStore = new Store(storeId, storeName, buyMultiplier, sellMultiplier, upgradeMultiplier, new ItemList(), generateItems(), restockTime, restockInterval);
		initialStore.restockStore();
		return initialStore;
	}

	function setupStore(): Store {
		let store = loadStore();
		console.log(store);
		if (!(store instanceof Store)) {
		  console.log('store not found, setting up');
		  store = generateInitialStore();
		//   store.restockStore();
		}
		updateRestockTimer();
		saveStore(store);
		return store;
	  }

	useEffect(() => {
		// Initialize store only on client side
		const initialStore = setupStore();
		setStore(initialStore);
	  }, []);
	

    const restockStore = () => {
		if (store) {
			const response = store.restockStore();
			if (!response.isSuccessful()) return response;
			saveStore(store);
			return response;
		} 
		const response = new InventoryTransactionResponse();
		response.addErrorMessage('Error restocking store: store does not exist');
		return response;
    };

	const restockTimeout = useRef<number | null>(null);
	const updateRestockTimer = useCallback(() => {
		if (!store) return;
		const currentTime = Date.now();
		if (currentTime > store.getRestockTime() && store.needsRestock()) {
			//Store is waiting for a restock, timer is finished
			const newRestockTime = currentTime + store.getRestockInterval();
			store.setRestockTime(newRestockTime);
			// Set a new timeout to trigger restock after the interval
			const remainingTime = newRestockTime - currentTime;
			restockTimeout.current = window.setTimeout(() => {
				if (store) {
					store.restockStore();
				}
			}, remainingTime);
		} else if (store.needsRestock()) {
			 // Set a timeout for the remaining time until the next restock
			const remainingTime = store.getRestockTime() - currentTime;
			restockTimeout.current = window.setTimeout(() => {
				if (store) {
					store.restockStore();
				}
			}, remainingTime);
		}
	}, [store]);

	useEffect(() => {
		// Start the timer when the component mounts
		updateRestockTimer();
	
		// Clean up the timer when the component unmounts
		return () => {
		  if (restockTimeout.current) {
			clearTimeout(restockTimeout.current);
		  }
		};
	  }, [updateRestockTimer]);

	const resetStore = () => {
		const newStore = generateInitialStore();
		setStore(newStore);
		saveStore(newStore);
	}

    return (
        <StoreContext.Provider value={{ store: store!, restockStore, resetStore, updateRestockTimer }}>
            {children}
        </StoreContext.Provider>
    );
};