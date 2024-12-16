import { Inventory } from "@/models/itemStore/inventory/Inventory";
import { ItemList } from "@/models/itemStore/ItemList";
import { generateNewPlaceholderInventoryItem} from "@/models/items/PlaceholderItems";
import { placeholderItemTemplates } from "@/models/items/templates/models/PlaceholderItemTemplate";
import { ItemSubtypes } from "@/models/items/ItemTypes";
import { v4 as uuidv4 } from 'uuid';
import User from "@/models/user/User";


let testInventory: Inventory;

beforeEach(() => {
	const item1 = generateNewPlaceholderInventoryItem("apple seed", 1);
	const item2 = generateNewPlaceholderInventoryItem("banana seed", 2);
	const item3 = generateNewPlaceholderInventoryItem("coconut seed", 3);
	const testItemList = new ItemList([item1, item2, item3]);
	testInventory = new Inventory(uuidv4(), User.getDefaultUserName(), 100, testItemList);
});

test('Should Initialize Default Inventory Object', () => {
	const inv = new Inventory(uuidv4(), "Dummy User", 100, new ItemList());
	expect(inv).not.toBeUndefined();
	expect(inv).not.toBeNull();
	expect(inv.getGold()).toBe(100);
	expect(inv.getOwnerName()).toBe("Dummy User");
	expect(inv.size()).toBe(0);
});

test('Should Get All Items', () => {
	const items = testInventory.getAllItems();
	expect(items.length).toBe(3);
})


test('Should Get Items By Subtype', () => {
	testInventory.gainItem(generateNewPlaceholderInventoryItem('apple', 1), 1);
	let items = testInventory.getItemsBySubtype(ItemSubtypes.SEED.name);
	expect(items.length).toBe(3);
	items = testInventory.getItemsBySubtype(ItemSubtypes.HARVESTED.name);
	expect(items.length).toBe(1);
	items = testInventory.getItemsBySubtype(ItemSubtypes.BLUEPRINT.name);
	expect(items.length).toBe(0);
})

test('Should Get Items By Subtype and Category', () => {
	testInventory.gainItem(generateNewPlaceholderInventoryItem('apple', 1), 1);
	let items = testInventory.getItemsBySubtype(ItemSubtypes.SEED.name, "Tree Fruit");
	expect(items.length).toBe(1);
	items = testInventory.getItemsBySubtype(ItemSubtypes.SEED.name, "Onion");
	expect(items.length).toBe(0);
	items = testInventory.getItemsBySubtype(ItemSubtypes.HARVESTED.name, "Tree Fruit");
	expect(items.length).toBe(1);
	items = testInventory.getItemsBySubtype(ItemSubtypes.BLUEPRINT.name);
	expect(items.length).toBe(0);
})

test('Should Find Item', () => {
	const getResponse = testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!);
	expect(getResponse.isSuccessful()).toBe(true);
	expect(getResponse.payload.itemData.name).toBe('apple seed');
	const containsResponse = testInventory.contains(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!);
	expect(containsResponse.isSuccessful()).toBe(true);
	expect(containsResponse.payload).toBe(true);
})

test('Should Not Find Nonexistent Item', () => {
	const getResponse = testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!);
	expect(getResponse.isSuccessful()).toBe(false);
	const containsResponse = testInventory.contains(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!);
	expect(containsResponse.isSuccessful()).toBe(true);
	expect(containsResponse.payload).toBe(false);
})

test('Should Gain Item To Inventory', () => {
	const response = testInventory.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 1);
	expect(response.isSuccessful()).toBe(true);
	expect(testInventory.size()).toBe(4);
	expect(testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!).payload.quantity).toBe(1);
	const response2 = testInventory.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 3);
	expect(response2.isSuccessful()).toBe(true);
	expect(testInventory.size()).toBe(4);
	expect(testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!).payload.quantity).toBe(4);
})

test('Should Not Gain Invalid Item', () => {
	expect(testInventory.size()).toBe(3);
	const response = testInventory.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 0);
	expect(response.isSuccessful()).toBe(false);
	expect(testInventory.size()).toBe(3);
	const response2 = testInventory.gainItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, -1);
	expect(response2.isSuccessful()).toBe(false);
	expect(testInventory.size()).toBe(3);
	const response3 = testInventory.gainItem(placeholderItemTemplates.getPlacedItemTemplateByName('apple')!, 1);
	expect(response3.isSuccessful()).toBe(false);
	expect(testInventory.size()).toBe(3);
})

test('Should Trash Item From Inventory', () => {
	const response = testInventory.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1);
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload.quantity).toBe(0);
	//Does not delete the item from the inventory
	expect(testInventory.size()).toBe(3);
	const response2 = testInventory.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!, 1);
	expect(response2.isSuccessful()).toBe(true);
	expect(response2.payload.quantity).toBe(1);
	expect(testInventory.size()).toBe(3);
	expect(testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!).payload.quantity).toBe(1);
})

test('Should Not Trash Nonexistent Item From Inventory', () => {
	const response = testInventory.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 1);
	expect(response.isSuccessful()).toBe(false);
	expect(testInventory.size()).toBe(3);
	const response2 = testInventory.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!, 0);
	expect(response2.isSuccessful()).toBe(false);
	expect(testInventory.size()).toBe(3);
	const response3 = testInventory.trashItem(placeholderItemTemplates.getInventoryItemTemplateByName('coconut seed')!, -1);
	expect(response3.isSuccessful()).toBe(false);
	expect(testInventory.size()).toBe(3);
})

//TODO: Verify payload is correct for buy/sell
test('Should Buy Item', () => {
	const response = testInventory.buyItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 1, 1);
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload.finalGold).toBe(100 - (placeholderItemTemplates.getInventoryItemTemplateByName('apple')?.getPrice(1) || 999));
	expect(response.payload.purchasedItem.quantity).toBe(1);
	expect(testInventory.size()).toBe(4);
	expect(testInventory.contains(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!).payload).toBe(true);
	const response2 = testInventory.buyItem(generateNewPlaceholderInventoryItem("apple", 1), 1, 1);
	expect(response2.isSuccessful()).toBe(true);
	expect(response2.payload.finalGold).toBe(100 - 2 * (placeholderItemTemplates.getInventoryItemTemplateByName('apple')?.getPrice(1) || 999));
	expect(response.payload.purchasedItem.quantity).toBe(2);
	expect(testInventory.size()).toBe(4);
	expect(testInventory.contains(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!).payload).toBe(true);
	expect(testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!).payload.quantity).toBe(2);
	expect(testInventory.getGold()).toBe(100 - 2 * (placeholderItemTemplates.getInventoryItemTemplateByName('apple')?.getPrice(1) || 999));
})

test('Should Not Buy Expensive Item', () => {
	const response = testInventory.buyItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 1, 10);
	expect(response.isSuccessful()).toBe(false);
	expect(testInventory.size()).toBe(3);
	expect(testInventory.contains(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!).payload).toBe(false);
	expect(testInventory.getGold()).toBe(100);
})

test('Should Not Buy Invalid Item', () => {
	const response = testInventory.buyItem(placeholderItemTemplates.getPlacedItemTemplateByName('apple')!, 1, 1);
	expect(response.isSuccessful()).toBe(false);
	const response2 = testInventory.buyItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 1, -1);
	expect(response2.isSuccessful()).toBe(false);
	expect(testInventory.getGold()).toBe(100);
})

test('Should Sell Item', () => {
	const response = testInventory.sellItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1, 1);
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload.finalGold).toBe(100 + (placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')?.getPrice(1) || 999));
	expect(response.payload.remainingItem.quantity).toBe(0);
	//Does not delete the item from the inventory
	expect(testInventory.size()).toBe(3);
	expect(testInventory.contains(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!).payload).toBe(false);
	const response2 = testInventory.sellItem(generateNewPlaceholderInventoryItem("banana seed", 1), 2, 1);
	expect(response2.isSuccessful()).toBe(true);
	expect(response2.payload.finalGold).toBe(100 + (placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')?.getPrice(1) || 999) + 2 * generateNewPlaceholderInventoryItem("banana seed", 1).itemData.getPrice(1));
	expect(response2.payload.remainingItem.quantity).toBe(1);
	expect(testInventory.size()).toBe(3);
	expect(testInventory.contains(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!).payload).toBe(true);
	expect(testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!).payload.quantity).toBe(1);
	const response3 = testInventory.sellItem(placeholderItemTemplates.getInventoryItemTemplateByName('coconut seed')!, 0.5, 2);
	expect(response3.isSuccessful()).toBe(true);
	expect(response3.payload.finalGold).toBe(100 + (placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')?.getPrice(1) || 999) + 2 * generateNewPlaceholderInventoryItem("banana seed", 1).itemData.getPrice(1) + 2 * generateNewPlaceholderInventoryItem("coconut seed", 1).itemData.getPrice(0.5));
	expect(response3.payload.remainingItem.quantity).toBe(1);
	expect(testInventory.size()).toBe(3);
	expect(testInventory.contains(placeholderItemTemplates.getInventoryItemTemplateByName('coconut seed')!).payload).toBe(true);
	expect(testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('coconut seed')!).payload.quantity).toBe(1);
	expect(testInventory.getGold()).toBe(100 + (placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')?.getPrice(1) || 999) + 2 * generateNewPlaceholderInventoryItem("banana seed", 1).itemData.getPrice(1) + 2 * generateNewPlaceholderInventoryItem("coconut seed", 1).itemData.getPrice(0.5));
})

test('Should Not Sell Nonexistent Item', () => {
	const response = testInventory.sellItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple')!, 1, 1);
	expect(response.isSuccessful()).toBe(false);
	const response2 = testInventory.sellItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1, 2);
	expect(response2.isSuccessful()).toBe(false);
	const response3 = testInventory.sellItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1, -1);
	expect(response3.isSuccessful()).toBe(false);
	const response4 = testInventory.sellItem(placeholderItemTemplates.getPlacedItemTemplateByName('apple')!, 1, 1);
	expect(response4.isSuccessful()).toBe(false);
	const response5 = testInventory.sellItem('not an item', 1, 1);
	expect(response5.isSuccessful()).toBe(false);
	expect(testInventory.getGold()).toBe(100);
})

test('Should Add Gold', () => {
	const response = testInventory.addGold(100);
	expect(response.isSuccessful()).toBe(true);
	expect(testInventory.getGold()).toBe(200);
})

test('Should Not Add Invalid Gold Amount', () => {
	const response = testInventory.addGold(0.5);
	expect(response.isSuccessful()).toBe(false);
	const response2 = testInventory.addGold(-1);
	expect(response2.isSuccessful()).toBe(false);
	expect(testInventory.getGold()).toBe(100);
})

test('Should Remove Gold', () => {
	const response = testInventory.removeGold(50);
	expect(response.isSuccessful()).toBe(true);
	expect(testInventory.getGold()).toBe(50);
	const response2 = testInventory.removeGold(120);
	expect(response2.isSuccessful()).toBe(true);
	expect(testInventory.getGold()).toBe(0);
})

test('Should Not Remove Invalid Gold Amount', () => {
	const response = testInventory.removeGold(0.5);
	expect(response.isSuccessful()).toBe(false);
	const response2 = testInventory.removeGold(-1);
	expect(response2.isSuccessful()).toBe(false);
	expect(testInventory.getGold()).toBe(100);
})

test('Should Use Item Then Delete', () => {
	const response = testInventory.useItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!, 1);
	expect(response.payload.originalItem.quantity).toBe(0);
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload.newTemplate.name).toBe('apple');
	expect(testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!).isSuccessful()).toBe(true);
})

test('Should Use Item', () => {
	const response = testInventory.useItem(placeholderItemTemplates.getInventoryItemTemplateByName('banana seed')!, 1);
	expect(response.payload.originalItem.quantity).toBe(1);
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload.newTemplate.name).toBe('banana');
	expect(testInventory.getItem(placeholderItemTemplates.getInventoryItemTemplateByName('apple seed')!).payload.quantity).toBe(1);
})

test('Should Not Use Item Lacking Quantity', () => {
	const response = testInventory.useItem(placeholderItemTemplates.getInventoryItemTemplateByName('coconut seed')!, 5);
	expect(response.isSuccessful()).toBe(false);
})

test('Should Create Inventory Object From PlainObject', () => {
	const serializedInventory = JSON.stringify((new Inventory(uuidv4(), "Dummy User", 100, new ItemList([generateNewPlaceholderInventoryItem('apple seed', 10)]))).toPlainObject());
	const inv = Inventory.fromPlainObject(JSON.parse(serializedInventory));
	expect(inv.getOwnerName()).toBe("Dummy User");
	expect(inv.size()).toBe(1);
	expect(inv.contains('apple seed').payload).toBe(true);
})