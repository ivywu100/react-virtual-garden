import { EmptyItem } from "../items/placedItems/EmptyItem";
import { PlacedItem } from "../items/placedItems/PlacedItem";
import { generateNewPlaceholderPlacedItem} from "../items/PlaceholderItems";
import { PlacedItemTemplate } from "../items/templates/models/PlacedItemTemplate";
import { placeholderItemTemplates } from "../items/templates/models/PlaceholderItemTemplate";
import User from "../user/User";
import { GardenTransactionResponse } from "./GardenTransactionResponse";
import { Plot } from "./Plot";
import { v4 as uuidv4 } from 'uuid';

export interface GardenDimensionEntity {
	rows: number,
	columns: number
}

export interface GardenEntity extends GardenDimensionEntity {
	id: string,
	owner: string
}

export interface ExtendedGardenEntity extends GardenEntity {
	owner_name: string;
}

export class Garden {
	private gardenId: string;
	private ownerName: string;
	private plots: Plot[][];
	private plotPositions: Map<Plot, [number, number]>;
	private rows: number;
	private columns: number;
	
	static getStartingRows() {return 5;}
	static getStartingCols() {return 5;}

	private static getGroundTemplate(): PlacedItemTemplate {
		const template = placeholderItemTemplates.getPlacedItemTemplateByName('ground');
		if (!template) throw new Error(`Error: Ground Template Does Not Exist!`);
		return template!;
	}

	constructor(gardenId: string, ownerName: string = "Dummy User", rows: number = Garden.getStartingRows(), cols: number = Garden.getStartingCols(), plots: Plot[][] | null = null) {
		this.gardenId = gardenId;
		this.ownerName = ownerName;
		this.rows = rows;
		this.columns = cols;
		this.plotPositions = new Map();
		if (plots != null) {
			this.plots = plots;
		} else {
			this.plots = Garden.generateEmptyPlots(rows, cols);
		}
		this.fillNullWithEmptyPlot(rows, cols);
		this.updatePlotPositions();
	}

	static fromPlainObject(plainObject: any): Garden {
		if (!plainObject || typeof plainObject !== 'object') {
			//we throw an error here which causes loadgarden to return [], causing it to reset everything.
			throw new Error('Invalid input to fromPlainObject');
		}
		const { gardenId, ownerName, plots: plainPlots, rows, columns } = plainObject;

		if (!Array.isArray(plainPlots)) {
			//if plots is not the right shape, throw away the entire thing
			return new Garden(gardenId, ownerName, Garden.getStartingRows(), Garden.getStartingCols(), null);
		}	
		// Convert plainPlots to Plot[][]
		const plots = plainPlots.map((row: any[]) => row.map((plot: any) => Plot.fromPlainObject(plot)));
		
		const garden = new Garden(gardenId, ownerName, rows, columns, plots);
		garden.updatePlotPositions();

		return garden;
		
	}

	toPlainObject(): any {

		return {
			gardenId: this.gardenId,
			ownerName: this.ownerName,
			plots: this.plots.map(row => row.map(plot => plot.toPlainObject())),
			rows: this.rows,
			columns: this.columns
		};
	} 

	static generateDefaultNewGarden(): Garden {
		const randomUuid = uuidv4();
		return new Garden(randomUuid, User.getDefaultUserName());
	}

	/**
	 * @returns the gardenId
	 */
	 getGardenId(): string {
		return this.gardenId;
	}

	/**
	 * @returns the ownerName of the owner of the garden.
	 */
	 getOwnerName(): string {
		return this.ownerName;
	}

	/**
	 * @returns the number of rows.
	 */
	 getRows(): number {
		return this.rows;
	}

	/**
	 * @returns the number of columns.
	 */
	 getCols(): number {
		return this.columns;
	}

	/**
	 * @returns a deep copy of the visible plots in the garden, based on the current rows and columns
	 */
	getPlots(): Plot[][] {
		// return this.plots;
		return this.plots.slice(0, this.rows).map(innerArray => innerArray.slice(0, this.columns));
		// return this.plots.slice(0, this.rows).map(innerArray =>
		// 	innerArray.slice(0, this.columns).map(plot => plot.clone())
		// );
	}

	/**
	 * @returns all plots of this garden, even hidden ones
	 */
	getAllPlots(): Plot[][] {
		return this.plots;
	}

	/**
     * Creates a 2D array of Empty Plots.
     * @rows number of rows 
	 * @cols number of columns
     * @returns Plot[][] with rows rows and cols columns, each containing an instance of Plot
     */
	static generateEmptyPlots(rows: number, cols: number): Plot[][] {
		const generateEmptyRow = (_: any, rowIndex: number) => {return Array(cols).fill(null).map((_, colIndex) => this.generateEmptyPlot(colIndex, rowIndex));}
		const gardenPlots = Array(rows).fill(null).map((_, rowIndex) => generateEmptyRow(_, rowIndex));
		return gardenPlots;
	}

	/**
     * Creates a single empty plot (containing ground)
     * @rowIndex - column index
	 * @colIndex - row index
     * @returns new Plot()
     */
	static generateEmptyPlot(rowIndex: number, colIndex: number): Plot {
		const ground = generateNewPlaceholderPlacedItem("ground", "");
		const newPlot = new Plot(uuidv4(), ground, Date.now(), 0);
		return newPlot;
	}

	/**
	 * Calculates if this garden can add a row (expand column).
	 * Can only add a row if number of rows is less than 5 + (level / 5).
	 * @currentRows the number of rows
	 * @currentLevel the level
	 * @returns true or false
	 */
	static canAddRow(currentRows: number, currentLevel: number) : boolean {
		if (currentRows + 1 <= 5 + Math.floor(currentLevel/5)) return true;
		return false;
	}

	/**
	 * Calculates if this garden can add a column (expand row).
	 * Can only add a column if number of columns is less than 5 + (level / 5).
	 * @currentColumns the number of columns
	 * @currentLevel the level
	 * @returns true or false
	 */
	static canAddColumn(currentColumns: number, currentLevel: number) : boolean {
		if (currentColumns + 1 <= 5 + Math.floor(currentLevel/5)) return true;
		return false;
	}

	/**
 	 * Adds an additional row to the garden.
	 * @returns success or failure
	 */
	addRow(user: User): boolean {
		if (!Garden.canAddRow(this.getRows(), user.getLevel())) return false;
		this.setGardenSize(this.getRows() + 1, this.getCols());
		return true;
	}

	/**
 	 * Adds an additional column to the garden.
	 * @returns success or failure
	 */
	addColumn(user: User): boolean {
		if (!Garden.canAddColumn(this.getCols(), user.getLevel())) return false;
		this.setGardenSize(this.getRows(), this.getCols() + 1);
		return true;
	}

	/**
	 * @currentRows the current number of rows
	 * @returns true/false
	 */
	static canRemoveRow(currentRows: number): boolean {
		return currentRows > 1;
	}

	/**
	 * @currentColumns the current number of columns
	 * @returns true/false
	 */
	static canRemoveColumn(currentColumns: number): boolean {
		return currentColumns > 1;
	}


	//TODO: Make this add decorations back to your inventory as blueprints
	/**
 	 * Removes a row from the garden. Items in that row are destroyed!
	 * @returns success or failure
	 */
	removeRow(): boolean {
		if (!Garden.canRemoveRow(this.getRows())) return false;
		this.setGardenSize(this.getRows() - 1, this.getCols());
		return true;
	}

	/**
 	 * Removes a column from the garden. Items in that row are destroyed!
	 * @returns success or failure
	 */
	removeColumn(): boolean {
		if (!Garden.canRemoveColumn(this.getCols())) return false;
		this.setGardenSize(this.getRows(), this.getCols() - 1);
		return true;
	}

	/**
 	 * Sets the visible garden size. Fills empty slots with Empty Plots.
	 * @rows new number of rows
	 * @cols new number of columns
	 */
	setGardenSize(rows: number, cols: number): void {
		// Loop through the rows up to the new row count
		for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
			// If the row does not exist, create it as an empty array
			if (!this.plots[rowIndex]) {
				this.plots[rowIndex] = [];
			}
			// Loop through the columns up to the new column count
			for (let colIndex = 0; colIndex < cols; colIndex++) {
				// If the column does not exist, generate an empty plot and fill it
				if (!this.plots[rowIndex][colIndex]) {
					this.plots[rowIndex][colIndex] = Garden.generateEmptyPlot(rowIndex, colIndex);
				}
			}
		}
	
		// Update garden dimensions
		this.rows = rows;
		this.columns = cols;
	}
	// setGardenSize(rows: number, cols: number): void {
	// 	const newPlots = Array.from({ length: rows }, (_, rowIndex) =>
	// 		Array.from({ length: cols }, (_, colIndex) =>
	// 			this.plots[rowIndex]?.[colIndex] || Garden.generateEmptyPlot(rowIndex, colIndex)
	// 		)
	// 	);
	// 	this.rows = rows;
	// 	this.columns = cols;
	// 	this.plots = newPlots;
	// 	this.fillNullWithEmptyPlot(rows, cols);
	// }

	/**
	 * Replaces all undefined slots in plots with Empty Plots.
	 */
	fillNullWithEmptyPlot(rows: number, cols: number): void {
		for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
			if (this.plots[rowIndex] === undefined) {
				this.plots[rowIndex] = [];
			}
			for (let colIndex = 0; colIndex < cols; colIndex++) {
				if (this.plots[rowIndex][colIndex] === undefined) {
					this.plots[rowIndex][colIndex] = Garden.generateEmptyPlot(rowIndex, colIndex);
				}
			}
		}
		this.updatePlotPositions();
	}

	/**
	 * Updates the position lookup for each plot.
	 */
	private updatePlotPositions(): void {
		this.plots.forEach((row, rowIndex) => {
			row.forEach((plot, colIndex) => {
				this.plotPositions.set(plot, [rowIndex, colIndex]);
			});
		});
	}

	/**
	 * Swaps the locations of two plots.
	 */
	 swapPlots(data1: Plot | [number, number], data2: Plot | [number, number]): void {
		if (Array.isArray(data1) && data1.length === 2  && Array.isArray(data2) && data2.length === 2) {
			const row1 = data1[0];
			const col1 = data1[1];
			const row2 = data2[0];
			const col2 = data2[1];
			if (this.isValidIndex(row1, col1) && this.isValidIndex(row2, col2)) {
				const plot1 = this.plots[row1][col1];
				const plot2 = this.plots[row2][col2];

				// Swap plots in the 2D array
				[this.plots[row1][col1], this.plots[row2][col2]] = [this.plots[row2][col2], this.plots[row1][col1]];
	
				// Update positions in the map
				const pos1 = this.plotPositions.get(plot1);
				const pos2 = this.plotPositions.get(plot2);
				if (pos1 && pos2) {
					this.plotPositions.set(plot1, [row2, col2]);
					this.plotPositions.set(plot2, [row1, col1]);
				}
				
			} else {
				console.error('Invalid Index while swapping plots');
				return;
			}
		} else if (data1 instanceof Plot && data2 instanceof Plot) {

			const pos1 = this.plotPositions.get(data1);
			const pos2 = this.plotPositions.get(data2);
	
			if (pos1 && pos2) {
				const [row1, col1] = pos1;
				const [row2, col2] = pos2;
	
				// Swap in the 2D array
				[this.plots[row1][col1], this.plots[row2][col2]] = [this.plots[row2][col2], this.plots[row1][col1]];
	
				// Update positions in the map
				this.plotPositions.set(data1, [row2, col2]);
				this.plotPositions.set(data2, [row1, col1]);
			} else {
				console.error('Cannot find plots in garden while swapping');
				return;
			}
		} else {
			//TODO: Console log failure or throw exception?
			console.error('Cannot swapPlots: plots are different type or incorrect format');
			return;
		}
	}

	/**
	 * Checks if the given row and column indexes are valid, ie. within the visible garden area
	 * @row the row index to check
	 * @col the column index to check
	 */
	private isValidIndex(row: number, col: number): boolean {
		return row >= 0 && row < this.getRows() && col >= 0 && col < this.getCols();
	}

	/**
	 * Changes the item in a plot in this garden
	 * @rowIndex - row index
	 * @colIndex - column index
	 * @item - the replacement PlacedItem
	 * @returns the plot changed
	 */
	setPlotItem(rowIndex: number, colIndex: number, item: PlacedItem): Plot {
		this.plots[rowIndex][colIndex].setItem(item);
		return this.plots[rowIndex][colIndex];
	}

	/**
	 * Gets the position of a plot.
	 */
	 getPlotPosition(plot: Plot): [number, number] | null {
		const position = this.plotPositions.get(plot);
		if (position) {
			return position;
		}
		return null;
	}

	/**
	 * Looks up a plot by its row and column.
	 * @row row index
	 * @col col index
	 * @returns the found plot, or null.
	 */
	getPlotByRowAndColumn(row: number, col: number): Plot | null {
		if (row >= 0 && row < this.plots.length && col >= 0 && col < this.plots[row].length) {
			return this.plots[row][col];
		}
		return null;
	}

	/**
	 * Helper function to call useItem and format the response.
	 * @plot the plot in the garden.
	 * @replacementItem item to replace with after modification
	 * @returns response containing:
	 * {originalItem: PlacedItem, 
	 *  updatedPlot: Plot, 
	 *  returnedItemTemplate: ItemTemplate}
	 */
	private replaceItemInPlot(plot: Plot, replacementItem: PlacedItem): GardenTransactionResponse {
		const response = new GardenTransactionResponse();
		const useItemResponse = plot.useItem(replacementItem, plot.getUsesRemaining());
		if (!useItemResponse.isSuccessful()) return useItemResponse;

		response.payload = {
			originalItem: useItemResponse.payload.originalItem,
			updatedPlot: plot,
			returnedItemTemplate: useItemResponse.payload.newTemplate
		};
		return response;
	}

	/**
	 * Verifies that the plot contains a Plant. Replaces the Plant with an item. Returns a response containing the harvested item.
	 * @plot the plot in the garden, or an object containing the row, col indexes.
	 * @replacementItem (optional) item to replace with after harvesting
	 * @returns response containing:
	 * {originalItem: PlacedItem, 
	 *  updatedPlot: Plot, 
	 *  harvestedItemTemplate: ItemTemplate}
	 */
	harvestPlot(plot: {row: number, col: number} | Plot, replacementItem: PlacedItem = new EmptyItem(uuidv4(), Garden.getGroundTemplate(), '')): GardenTransactionResponse {
		const response = new GardenTransactionResponse();
		let data: Plot | {row: number, col: number} | null = plot;
		if (!(plot instanceof Plot)) {
			data = this.getPlotByRowAndColumn(plot.row, plot.col);
			if (data == null) {
				response.addErrorMessage(`Could not find Plot at (${plot.row}, ${plot.col})`);
				return response;
			}
		} else {
			if (!this.plotPositions.has(plot)) {
				response.addErrorMessage(`Could not find Plot in this Garden.`);
				return response;
			}
		}
		let plotToHarvest = data as Plot;
		if (plotToHarvest.getItemSubtype() !== 'Plant') {
			response.addErrorMessage(`Item is not of type Plant, is of type ${plotToHarvest.getItemSubtype()}`);
			return response;
		}
		const replaceResponse = this.replaceItemInPlot(plotToHarvest, replacementItem);
		if (!replaceResponse.isSuccessful()) return replaceResponse;
		response.payload = {
			originalItem: replaceResponse.payload.originalItem, 
			updatedPlot: replaceResponse.payload.updatedPlot, 
			harvestedItemTemplate:  replaceResponse.payload.returnedItemTemplate
		}
		return response;
	}

	/**
	 * Verifies that the plot contains a Decoration. Replaces the Decoration with an item. Returns a response containing the blueprint.
	 * @plot the plot in the garden, or an object containing the row, col indexes.
	 * @replacementItem (optional) item to replace with after harvesting
	 * @returns response containing:
	 * {originalItem: PlacedItem, 
	 *  updatedPlot: Plot, 
	 *  blueprintItemTemplate: ItemTemplate}
	 */
	repackagePlot(plot: {row: number, col: number} | Plot, replacementItem: PlacedItem = new EmptyItem(uuidv4(), Garden.getGroundTemplate(), '')): GardenTransactionResponse {
		const response = new GardenTransactionResponse();
		let data: Plot | {row: number, col: number} | null = plot;
		if (!(plot instanceof Plot)) {
			data = this.getPlotByRowAndColumn(plot.row, plot.col);
			if (data == null) {
				response.addErrorMessage(`Could not find Plot at (${plot.row}, ${plot.col})`);
				return response;
			}
		} else {
			if (!this.plotPositions.has(plot)) {
				response.addErrorMessage(`Could not find Plot in this Garden.`);
				return response;
			}
		}
		let plotToHarvest = data as Plot;
		if (plotToHarvest.getItemSubtype() !== 'Decoration') {
			response.addErrorMessage(`Item is not of type Decoration, is of type ${plotToHarvest.getItemSubtype()}`);
			return response;
		}
		const replaceResponse = this.replaceItemInPlot(plotToHarvest, replacementItem);
		if (!replaceResponse.isSuccessful()) return replaceResponse;
		response.payload = {
			originalItem: replaceResponse.payload.originalItem, 
			updatedPlot: replaceResponse.payload.updatedPlot, 
			blueprintItemTemplate:  replaceResponse.payload.returnedItemTemplate
		}
		return response;
	}

	/**
     * Get the number of plots in the garden.
     * @returns The number of plots in the garden.
     */
	size(): number {
		return this.getRows() * this.getCols();
	}

}