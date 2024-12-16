import ItemStoreComponent from "@/components/itemStore/itemStore";
import { triggerAsyncId } from "async_hooks";
import Toolbox from "../garden/tools/Toolbox";
import { ItemSubtypes } from "../items/ItemTypes";
import { PlacedItem } from "../items/placedItems/PlacedItem";
import { DecorationTemplate } from "../items/templates/models/DecorationTemplate";
import { placeholderItemTemplates } from "../items/templates/models/PlaceholderItemTemplate";
import { PlantTemplate } from "../items/templates/models/PlantTemplate";
import LevelSystem, { LevelSystemEntity } from "../level/LevelSystem";
import { BooleanResponse } from "../utility/BooleanResponse";
import { actionHistoryFactory } from "./history/actionHistory/ActionHistoryFactory";
import { ActionHistoryList } from "./history/ActionHistoryList";
import { ItemHistoryList } from "./history/ItemHistoryList";
import Icon from "./icons/Icon";
import { v4 as uuidv4 } from 'uuid';
import ItemHistory from "./history/itemHistory/ItemHistory";

export interface UserEntity {
	id: string;
	username: string;
	icon: string;
}

class User {
	private userId: string; //Linked to firebase, creating a new account will set this up manually
	private username: string;
	private icon: string; //indexes into a list of icons by name
	private level: LevelSystem;
	private itemHistory: ItemHistoryList;
	private actionHistory: ActionHistoryList;
	private toolbox: Toolbox;

	constructor(userId: string, username: string, icon: string, level: LevelSystem = new LevelSystem(uuidv4()), itemHistory: ItemHistoryList = new ItemHistoryList, actionHistory: ActionHistoryList = new ActionHistoryList(), toolbox: Toolbox = new Toolbox()) {
		this.userId = userId;
		this.username = username;
		this.icon = icon;
		this.level = level;
		this.itemHistory = itemHistory;
		this.actionHistory = actionHistory;
		this.toolbox = toolbox;
	}

	static fromPlainObject(plainObject: any) {
		try {
            // Validate plainObject structure
            if (!plainObject || typeof plainObject !== 'object') {
                throw new Error('Invalid plainObject structure for User');
            }
			const { userId, username, icon, level, itemHistory, actionHistory, toolbox } = plainObject;
			// Perform additional type checks if necessary
			if (typeof userId !== 'string') {
				throw new Error('Invalid userId property in plainObject for User');
			}
			if (typeof username !== 'string') {
				throw new Error('Invalid username property in plainObject for User');
			}
			if (typeof icon !== 'string') {
				throw new Error('Invalid icon property in plainObject for User');
			}
			const hydratedLevel = LevelSystem.fromPlainObject(level);
			const hydratedItemHistory = ItemHistoryList.fromPlainObject(itemHistory);
			const hydratedActionHistory = ActionHistoryList.fromPlainObject(actionHistory);
			const hydratedToolbox = Toolbox.fromPlainObject(toolbox);
			return new User(userId, username, icon, hydratedLevel, hydratedItemHistory, hydratedActionHistory, hydratedToolbox);
			
		} catch (err) {
			console.error('Error creating User from plainObject:', err);
            return new User("999999999999999999999999999", "Error User", "error");
		}
	}

	toPlainObject(): any {
		return {
			userId: this.userId,
			username: this.username,
			icon: this.icon,
			level: this.level.toPlainObject(),
			itemHistory: this.itemHistory.toPlainObject(),
			actionHistory: this.actionHistory.toPlainObject(),
			toolbox: this.toolbox.toPlainObject(),
		};
	}

	static generateLocalUid(length: number = 28): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let uid = '';
		for (let i = 0; i < length; i++) {
			uid += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return uid;
	}

	static generateDefaultNewUser(): User {
		const randomUid = User.generateLocalUid();
		return this.generateNewUserWithId(randomUid);
	}

	static generateNewUserWithId(firebaseUid: string): User {
		return new User(firebaseUid, this.getDefaultUserName(), 'apple');
	}

	static getDefaultUserName(): string {
		return "Unknown Farmer";
	}

	getUserId(): string {
		return this.userId;
	}

	getUsername(): string {
		return this.username;
	}

	setUsername(newUsername: string): void {
		this.username = newUsername;
	}

	getIcon(): string {
		return this.icon;
	}

	setIcon(newIcon: string): void {
		this.icon = newIcon;
	}

	getItemHistory() {
		return this.itemHistory;
	}

	getActionHistory() {
		return this.actionHistory;
	}

	/**
	 * @returns the level of the user
	 */
	 getLevel(): number {
		return this.level.getLevel();
	}

	/**
	 * @returns the total xp needed to level up
	 */
	getExpToLevelUp(): number {
		return this.level.getExpToLevelUp();
	}

	/**
	 * @returns the user's current xp
	 */
	getCurrentExp(): number {
		return this.level.getCurrentExp();
	}

	/**
	 * @returns the growth rate, higher = faster
	 */
	getGrowthRate(): number {
		return this.level.getGrowthRate();
	}

	getLevelSystem(): LevelSystem {
		return this.level;
	}

	/**
	 * @exp the quantity of xp to add
	 */
	addExp(exp: number) {
		return this.level.addExperience(exp);
	}

	/**
	 * Updates this user's itemHistory and actionHistory following the harvest of a plant.
	 * @item the item that was harvested
	 * @returns Response containing true or an error message on failure
	 */
	updateHarvestHistory(plantItem: PlacedItem): BooleanResponse {
		const response = new BooleanResponse();
		if (plantItem.itemData.subtype !== ItemSubtypes.PLANT.name) {
			response.addErrorMessage(`Error updating history: attempting to harvest item of type ${plantItem.itemData.subtype}`);
			return response;
		}
		const itemHistory = new ItemHistory(uuidv4(), plantItem.itemData, 1);
		this.itemHistory.addItemHistory(itemHistory);
		const harvestAllHistory = actionHistoryFactory.createActionHistoryByIdentifiers(plantItem.itemData.subtype, 'all', 'harvested', 1);
		const harvestCategoryHistory = actionHistoryFactory.createActionHistoryByIdentifiers(plantItem.itemData.subtype, plantItem.itemData.category, 'harvested', 1);
		if (harvestAllHistory) {
			this.actionHistory.addActionHistory(harvestAllHistory);
			response.payload = true;
		} else {
			//probably impossible to reach, would only occur if allHistory doesn't exist, which requires modification of histories.json
			response.addErrorMessage(`Error updating history: could not find all action history`);
		}

		if (harvestCategoryHistory) {
			this.actionHistory.addActionHistory(harvestCategoryHistory);
			response.payload = true;
		} else {
			response.addErrorMessage(`Error updating history: could not find action history for item ${plantItem.itemData.name}`);
		}
		
		return response;
	}

	/**
	 * Updates this user's itemHistory and actionHistory following the placement of a decoration.
	 * @item the item that was placedharvested
	 * @returns Response containing true or an error message on failure
	 */
	 updateDecorationHistory(decorationItem: PlacedItem): BooleanResponse {
		const response = new BooleanResponse();
		if (decorationItem.itemData.subtype !== ItemSubtypes.DECORATION.name) {
			response.addErrorMessage(`Error updating history: attempting to place item of type ${decorationItem.itemData.subtype}`);
			return response;
		}
		const itemHistory = new ItemHistory(uuidv4(), decorationItem.itemData, 1);
		this.itemHistory.addItemHistory(itemHistory);
		const placeDecorationHistory = actionHistoryFactory.createActionHistoryByIdentifiers(decorationItem.itemData.subtype, decorationItem.itemData.category, 'placed', 1);

		if (placeDecorationHistory) {
			this.actionHistory.addActionHistory(placeDecorationHistory);
			response.payload = true;
		} else {
			response.addErrorMessage(`Error updating history: could not find action history for item ${decorationItem.itemData.name}`);
		}
		
		return response;
	}

	isIconUnlocked(iconOption: Icon) {
		if (iconOption.getName() === 'apple') return true;
		const template = placeholderItemTemplates.getPlacedItemTemplateByName(iconOption.getName());
		if (!template) return false;
		const itemAvailable = this.getItemHistory().contains(template);
		if (itemAvailable.payload) {
			return true;
		}
		return false;
	}
}
export default User;