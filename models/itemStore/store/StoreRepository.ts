import storeData from '@/data/store/Stores.json';
import { StoreInterface } from "./StoreInterface";

class StoreRepository {
	stores: StoreInterface[];

	constructor() {
		this.stores = [];
		this.loadHistory();
	}

  	loadHistory() {
		storeData.Stores.forEach((store: any) => {
			this.stores.push(this.createStore(store));
		})
  	}

	private createStore(store: any): StoreInterface {

		return {
			id: store.id,
			name: store.name,
			stocklistId: store.stocklistId,
			stocklistName: store.stocklistName,
			buyMultiplier: store.buyMultiplier,
			sellMultiplier: store.sellMultiplier,
			upgradeMultiplier: store.upgradeMultiplier,
			restockInterval: store.restockInterval,
		}
	}

	getStoreInterfaceById(id: number): StoreInterface | null {
		const stores = Object.values(this.stores).flat().filter(list => list.id === id);
		if (stores.length === 1) return stores[0];
		else if (stores.length === 0) return null;
		else {
			console.error('Error: found multiple stores with the same id!');
			console.error(stores);
			return null;
		}
	}

	getStoreInterfaceByName(name: string): StoreInterface | null {
		const stores = Object.values(this.stores).flat().filter(list => list.name === name);
		if (stores.length === 1) return stores[0];
		else if (stores.length === 0) return null;
		else {
			console.error('Error: found multiple stores with the same name!');
			console.error(stores);
			return null;
		}
	}
}

export const storeRepository = new StoreRepository();