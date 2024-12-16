import { ItemSubtypes } from "@/models/items/ItemTypes";
import { generateNewPlaceholderInventoryItem } from "@/models/items/PlaceholderItems";
import { placeholderItemTemplates } from "@/models/items/templates/models/PlaceholderItemTemplate";
import { Inventory } from "@/models/itemStore/inventory/Inventory";
import { ItemList } from "@/models/itemStore/ItemList";
import { Store } from "@/models/itemStore/store/Store";
import User from "@/models/user/User";
import { v4 as uuidv4 } from 'uuid';

let testStore: Store;
let testInventory: Inventory;

beforeEach(() => {
	const item1 = generateNewPlaceholderInventoryItem("apple seed", 1);
	const item2 = generateNewPlaceholderInventoryItem("banana seed", 20);
	const item3 = generateNewPlaceholderInventoryItem("coconut seed", 30);
	const testItemList = new ItemList([item1, item2, item3]);
	testStore = new Store(uuidv4(), 1, "Test Store", 2.0, 1.0, 1, testItemList, new ItemList(), 0, 60000);
	const item4 = generateNewPlaceholderInventoryItem("apple seed", 1);
	const testItemList2 = new ItemList([item4]);
	testInventory = new Inventory(uuidv4(), User.getDefaultUserName(), 100, testItemList2);
});

test('Should Initialize Default Store Object', () => {
	const inv = new Store(uuidv4(), 1, "Dummy Store", 2.0, 1.0, 1, new ItemList(), new ItemList(), 0, 60000);
	expect(inv).not.toBeUndefined();
	expect(inv).not.toBeNull();
	expect(inv.getStoreIdentifier()).toBe(1);
	expect(inv.getStoreName()).toBe("Dummy Store");
	expect(inv.size()).toBe(0);
	expect(inv.getBuyMultiplier()).toBe(2);
	expect(inv.getSellMultiplier()).toBe(1);
	const item = generateNewPlaceholderInventoryItem("apple seed", 1);
	expect(inv.getBuyPrice(item)).toBe(inv.getBuyMultiplier() * item.itemData.value);
	expect(inv.getSellPrice(item)).toBe(inv.getSellMultiplier() * item.itemData.value);
	inv.setBuyMultiplier(100);
	inv.setSellMultiplier(100);
	expect(inv.getBuyMultiplier()).toBe(100);
	expect(inv.getSellMultiplier()).toBe(100);

});

test('Should Get All Items', () => {
	const items = testStore.getAllItems();
	expect(items.length).toBe(3);
})

test('Should Get Items By Subtype', () => {
	testStore.gainItem(generateNewPlaceholderInventoryItem('apple', 1), 1);
	let items = testStore.getItemsBySubtype(ItemSubtypes.SEED.name);
	expect(items.length).toBe(3);
	items = testStore.getItemsBySubtype(ItemSubtypes.HARVESTED.name);
	expect(items.length).toBe(1);
	items = testStore.getItemsBySubtype(ItemSubtypes.BLUEPRINT.name);
	expect(items.length).toBe(0);
})

test('Should Get Items By Subtype and Category', () => {
	testStore.gainItem(generateNewPlaceholderInventoryItem('apple', 1), 1);
	let items = testStore.getItemsBySubtype(ItemSubtypes.SEED.name, "Tree Fruit");
	expect(items.length).toBe(1);
	items = testStore.getItemsBySubtype(ItemSubtypes.SEED.name, "Onion");
	expect(items.length).toBe(0);
	items = testStore.getItemsBySubtype(ItemSubtypes.HARVESTED.name, "Tree Fruit");
	expect(items.length).toBe(1);
	items = testStore.getItemsBySubtype(ItemSubtypes.BLUEPRINT.name);
	expect(items.length).toBe(0);
})

test('Should Find Item', () => {
	const getResponse = testStore.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!);
	expect(getResponse.isSuccessful()).toBe(true);
	expect(getResponse.payload.itemData.name).toBe('apple seed');
	const containsResponse = testStore.contains(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!);
	expect(containsResponse.isSuccessful()).toBe(true);
	expect(containsResponse.payload).toBe(true);
})

test('Should Not Find Nonexistent Item', () => {
	const getResponse = testStore.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!);
	expect(getResponse.isSuccessful()).toBe(false);
	const containsResponse = testStore.contains(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!);
	expect(containsResponse.isSuccessful()).toBe(true);
	expect(containsResponse.payload).toBe(false);
})

test('Should Gain Item To Store', () => {
	const response = testStore.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 1);
	expect(response.isSuccessful()).toBe(true);
	expect(testStore.size()).toBe(4);
	expect(testStore.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!).payload.quantity).toBe(1);
	const response2 = testStore.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 3);
	expect(response2.isSuccessful()).toBe(true);
	expect(testStore.size()).toBe(4);
	expect(testStore.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!).payload.quantity).toBe(4);
})

test('Should Not Gain Invalid Item', () => {
	expect(testStore.size()).toBe(3);
	const response = testStore.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 0);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	const response2 = testStore.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, -1);
	expect(response2.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	const response3 = testStore.gainItem(placeholderItemTemplates.getPlacedItemTemplateByName('apple')!, 1);
	expect(response3.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
})

test('Should Trash Item From Store', () => {
	const response = testStore.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1);
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload.quantity).toBe(0);
	//Does not delete item
	expect(testStore.size()).toBe(3);
	const response2 = testStore.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!, 1);
	expect(response2.isSuccessful()).toBe(true);
	expect(response2.payload.quantity).toBe(19);
	expect(testStore.size()).toBe(3);
	expect(testStore.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!).payload.quantity).toBe(19);
})

test('Should Not Trash Nonexistent Item From Store', () => {
	const response = testStore.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 1);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	const response2 = testStore.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!, 0);
	expect(response2.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	const response3 = testStore.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('coconut seed')!, -1);
	expect(response3.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
})

test('Should Buy Out Existing Item From Store', () => {
	const response = testStore.buyItemFromStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1);
	expect(response.isSuccessful()).toBe(true);
	expect(testStore.contains('apple seed').payload).toBe(false);
	expect(testInventory.getGold()).toBe(100 - testStore.getBuyPrice(response.payload.storeItem) * 1);
	expect(testInventory.getItem('apple seed').payload.quantity).toBe(2);
	expect(response.payload.finalGold).toBe(100 - testStore.getBuyPrice(response.payload.storeItem) * 1);
	expect(response.payload.storeItem.quantity).toBe(0);
	expect(response.payload.purchasedItem.quantity).toBe(2);
})

test('Should Buy Existing Item From Store', () => {
	const response = testStore.buyItemFromStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!, 2);
	expect(response.isSuccessful()).toBe(true);
	expect(testStore.getItem('banana seed').payload.quantity).toBe(18);
	expect(testInventory.getGold()).toBe(100 - testStore.getBuyPrice(response.payload.storeItem) * 2);
	expect(testInventory.getItem('banana seed').payload.quantity).toBe(2);
	expect(response.payload.finalGold).toBe(100 - testStore.getBuyPrice(response.payload.storeItem) * 2);
	expect(response.payload.storeItem.quantity).toBe(18);
	expect(response.payload.purchasedItem.quantity).toBe(2);
})

test('Should Not Buy Nonexisting Item From Store', () => {
	const response = testStore.buyItemFromStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('bench blueprint')!, 1);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	expect(testInventory.getGold()).toBe(100);
	expect(testInventory.getItem('apple seed').payload.quantity).toBe(1);
})

test('Should Not Buy Nonexisting Quantity From Store', () => {
	const response = testStore.buyItemFromStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, -1);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	expect(testInventory.getGold()).toBe(100);
	expect(testInventory.getItem('apple seed').payload.quantity).toBe(1);
})

test('Should Not Buy Item From Store With High Price', () => {
	testInventory.removeGold(99);
	expect(testInventory.getGold()).toBe(1);
	const response = testStore.buyItemFromStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	expect(testInventory.getGold()).toBe(1);
	expect(testInventory.getItem('apple seed').payload.quantity).toBe(1);
})

test('Should Not Buy Item From Store With High Quantity', () => {
	const response = testStore.buyItemFromStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 2);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	expect(testInventory.getGold()).toBe(100);
	expect(testInventory.getItem('apple seed').payload.quantity).toBe(1);
})

test('Should Sell Out Item To Store', () => {
	const response = testStore.sellItemToStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1);
	expect(response.isSuccessful()).toBe(true);
	expect(testInventory.contains('apple seed').payload).toBe(false);
	expect(testInventory.getGold()).toBe(100 + testStore.getSellPrice(response.payload.storeItem) * 1);
	expect(testStore.getItem('apple seed').payload.quantity).toBe(2);
	expect(response.payload.finalGold).toBe(100 + testStore.getSellPrice(response.payload.storeItem) * 1);
	expect(response.payload.storeItem.quantity).toBe(2);
	expect(response.payload.soldItem.quantity).toBe(0);
})

test('Should Sell Existing Item To Store', () => {
	testInventory.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 100);
	const response = testStore.sellItemToStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 10);
	expect(response.isSuccessful()).toBe(true);
	expect(testInventory.getItem('apple seed').payload.quantity).toBe(91);
	expect(testInventory.getGold()).toBe(100 + testStore.getSellPrice(response.payload.storeItem) * 10);
	expect(testStore.getItem('apple seed').payload.quantity).toBe(11);
	expect(response.payload.finalGold).toBe(100 + testStore.getSellPrice(response.payload.storeItem) * 10);
	expect(response.payload.storeItem.quantity).toBe(11);
	expect(response.payload.soldItem.quantity).toBe(91);
})


test('Should Not Sell Nonexisting Item To Store', () => {
	const response = testStore.sellItemToStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!, 1);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	expect(testInventory.getGold()).toBe(100);
	expect(testInventory.getItem('banana seed').isSuccessful()).toBe(false);
})

test('Should Not Sell Nonexisting Quantity To Store', () => {
	const response = testStore.sellItemToStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, -1);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	expect(testInventory.getGold()).toBe(100);
	expect(testInventory.getItem('apple seed').payload.quantity).toBe(1);
})

test('Should Not Sell Item To Store With High Quantity', () => {
	const response = testStore.sellItemToStore(testInventory, placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 100);
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.size()).toBe(3);
	expect(testInventory.getGold()).toBe(100);
	expect(testInventory.getItem('apple seed').payload.quantity).toBe(1);
})

test('Should Delete All', () => {
	const response = testStore.emptyStore();
	expect(response.isSuccessful()).toBe(true);
	expect(testStore.size()).toBe(0);
	expect(testStore.contains('apple seed').payload).toBe(false);
})

test('Should Restock Store With Default', () => {
	testStore.setStockList(new ItemList([generateNewPlaceholderInventoryItem('apple seed', 100), generateNewPlaceholderInventoryItem('banana seed', 99)]));
	const response = testStore.restockStore();
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload).toBe(true);
	expect(testStore.getItem('apple seed').payload.getQuantity()).toBe(100);
	expect(testStore.getItem('banana seed').payload.getQuantity()).toBe(99);
})

test('Should Restock Store With Explicit StockList', () => {
	testStore.setStockList(new ItemList([generateNewPlaceholderInventoryItem('apple seed', 1), generateNewPlaceholderInventoryItem('banana seed', 1)]));
	const response = testStore.restockStore(new ItemList([generateNewPlaceholderInventoryItem('apple seed', 100), generateNewPlaceholderInventoryItem('banana seed', 99)]));
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload).toBe(true);
	expect(testStore.getItem('apple seed').payload.getQuantity()).toBe(100);
	expect(testStore.getItem('banana seed').payload.getQuantity()).toBe(99);
})

test('Should Not Restock Lower Quantity', () => {
	testStore.gainItem(generateNewPlaceholderInventoryItem('apple seed', 100), 100);
	testStore.setStockList(new ItemList([generateNewPlaceholderInventoryItem('apple seed', 1), generateNewPlaceholderInventoryItem('banana seed', 1)]));
	const response = testStore.restockStore();
	expect(response.isSuccessful()).toBe(false);
})

test('Should Rollback on Failing Restock', () => {
	testStore.setStockList(new ItemList([generateNewPlaceholderInventoryItem('apple seed', -1), generateNewPlaceholderInventoryItem('harvestedApple', -1)]));
	const response = testStore.restockStore();
	expect(response.isSuccessful()).toBe(false);
	expect(testStore.getItem('apple seed').payload.getQuantity()).toBe(1);
	expect(testStore.getItem('banana seed').payload.getQuantity()).toBe(20);
	expect(testStore.contains('apple').payload).toBe(false);
})

test('Should Create Store Object From PlainObject', () => {
	const serializedStore = JSON.stringify((new Store(uuidv4(), 0, "Test Store", 1, 1, 1, new ItemList([generateNewPlaceholderInventoryItem('apple seed', 5)]), new ItemList([]), Date.now() + 1000000, 60000)).toPlainObject());
	const store = Store.fromPlainObject(JSON.parse(serializedStore));
	expect(store.getStoreIdentifier()).toBe(0);
	expect(store.size()).toBe(1);
	expect(store.getItem('apple seed').payload.quantity).toBe(5);
})

test('Should Spend Gold On Custom Object', () => {
	const response = testStore.buyCustomObjectFromStore(testInventory, 100);
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload).toBe(0);
	expect(testInventory.getGold()).toBe(0);
})

test('Should Not Spend Insufficient Gold On Custom Object', () => {
	const response = testStore.buyCustomObjectFromStore(testInventory, 200);
	expect(response.isSuccessful()).toBe(false);
	expect(testInventory.getGold()).toBe(100);
})

test('Should Need Restock', () => {
	testStore.setStockList(new ItemList([generateNewPlaceholderInventoryItem('apple seed', 2)]));
	const restock = testStore.needsRestock();
	expect(restock).toBe(true);
	const restock2 = testStore.needsRestock(new ItemList([generateNewPlaceholderInventoryItem('apple', 1)]))
	expect(restock2).toBe(true);
})

test('Should Not Need Restock', () => {
	testStore.setStockList(new ItemList([generateNewPlaceholderInventoryItem('apple seed', 1)]));
	const restock = testStore.needsRestock();
	expect(restock).toBe(false);
	testStore.gainItem(generateNewPlaceholderInventoryItem('apple', 100), 100);
	const restock2 = testStore.needsRestock(new ItemList([generateNewPlaceholderInventoryItem('apple', 1)]))
	expect(restock2).toBe(false);
})