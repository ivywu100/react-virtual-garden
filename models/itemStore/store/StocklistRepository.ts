import { StocklistInterface } from "./StocklistInterface";
import stocklistData from '@/data/store/Stocklists.json';
import { ItemList } from "../ItemList";
import { generateNewPlaceholderInventoryItem } from "@/models/items/PlaceholderItems";

class StocklistRepository {
	stocklists: StocklistInterface[];

	constructor() {
		this.stocklists = [];
		this.loadHistory();
	}

  	loadHistory() {
		stocklistData.Stocklists.forEach((stocklist: any) => {
			this.stocklists.push(this.createStocklist(stocklist));
		})
  	}

	private createStocklist(stocklist: any): StocklistInterface {
		const itemList = new ItemList();
		stocklist.items.forEach((item: any) => {
			const foundItem = generateNewPlaceholderInventoryItem(item.name, item.quantity);
			if (foundItem.itemData.name !== 'error') {
				itemList.addItem(foundItem, foundItem.getQuantity());
			}
		})

		return {
			id: stocklist.id,
			name: stocklist.name,
			items: itemList
		}
	}

	getStocklistInterfaceById(id: string): StocklistInterface | null {
		const stocklists = Object.values(this.stocklists).flat().filter(list => list.id === id);
		if (stocklists.length === 1) return stocklists[0];
		else if (stocklists.length === 0) return null;
		else {
			console.error('Error: found multiple stocklists with the same id!');
			console.error(stocklists);
			return null;
		}
	}

	getStocklistInterfaceByName(name: string): StocklistInterface | null {
		const stocklists = Object.values(this.stocklists).flat().filter(list => list.name === name);
		if (stocklists.length === 1) return stocklists[0];
		else if (stocklists.length === 0) return null;
		else {
			console.error('Error: found multiple stocklists with the same name!');
			console.error(stocklists);
			return null;
		}
	}
}

export const stocklistRepository = new StocklistRepository();