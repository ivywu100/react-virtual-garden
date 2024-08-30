import { Decoration } from "@/models/items/placedItems/Decoration";
import { EmptyItem } from "@/models/items/placedItems/EmptyItem";
import { Plant } from "@/models/items/placedItems/Plant";
import { DecorationTemplate } from "@/models/items/templates/models/DecorationTemplate";
import { EmptyItemTemplate } from "@/models/items/templates/models/EmptyItemTemplate";
import { placeholderItemTemplates } from "@/models/items/templates/models/PlaceholderItemTemplate";
import { PlantTemplate } from "@/models/items/templates/models/PlantTemplate";

let plantItem: Plant;
let decorationItem: Decoration;
let emptyItem: EmptyItem;

beforeEach(() => {
	let template = placeholderItemTemplates.getPlacedItemTemplateByName('apple') as PlantTemplate;
	plantItem = new Plant(template, '');
	let template2 = placeholderItemTemplates.getPlacedItemTemplateByName('bench') as DecorationTemplate;
	decorationItem = new Decoration(template2, '');
	let template3 = placeholderItemTemplates.getPlacedItemTemplateByName('ground') as EmptyItemTemplate;
	emptyItem = new EmptyItem(template3, 'ground');
})

test('Should Initialize PlacedItem Object', () => {
	expect(plantItem).toBeTruthy();
	expect(plantItem.itemData.name).toBe('apple');
	expect(plantItem.getStatus()).toBe('');
	plantItem.setStatus('changed');
	expect(plantItem.getStatus()).toBe('changed');

	expect(decorationItem).toBeTruthy();
	expect(decorationItem.itemData.name).toBe('bench');
	expect(decorationItem.getStatus()).toBe('');

	expect(emptyItem).toBeTruthy();
	expect(emptyItem.itemData.name).toBe('ground');
	expect(emptyItem.getStatus()).toBe('ground');

})

test('Should Use Decoration Item', () => {
	const item = decorationItem;
	const response = item.use();
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload.newTemplate.name).toBe('bench blueprint');
})

test('Should Use Plant Item', () => {
	const item = plantItem;
	const response = item.use();
	expect(response.isSuccessful()).toBe(true);
	expect(response.payload.newTemplate.name).toBe('apple');
})

test('Should Not Use EmptyItem Item', () => {
	const item = emptyItem;
	const response = item.use();
	expect(item.getStatus()).toBe('ground');
	expect(response.isSuccessful()).toBe(false);
})

//PlacedItem does not have a functional fromPlainObject method
// test('Should Create PlacedItem Object From PlainObject', () => {
	// const serializedPlacedItem = JSON.stringify((generateNewPlaceholderPlacedItem('apple', 'abc')).toPlainObject());
	// const item = PlacedItem.fromPlainObject(JSON.parse(serializedPlacedItem));
	// expect(item).toBeTruthy();
	// expect(item.itemData.name).toBe('apple');
	// expect(item.getStatus()).toBe('abc');
// })