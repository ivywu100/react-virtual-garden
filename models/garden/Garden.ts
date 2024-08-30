import { EmptyItem } from "../items/placedItems/EmptyItem";
import { PlacedItem } from "../items/placedItems/PlacedItem";
import { generateNewPlaceholderPlacedItem} from "../items/PlaceholderItems";
import { PlacedItemTemplate } from "../items/templates/models/PlacedItemTemplate";
import { placeholderItemTemplates } from "../items/templates/models/PlaceholderItemTemplate";
import User from "../user/User";
import { GardenTransactionResponse } from "./GardenTransactionResponse";
import { Plot } from "./Plot";

export class Garden {
	
	private userId: string;
	private plots: Plot[][];
	private plotPositions: Map<Plot, [number, number]>;
	
	static getStartingRows() {return 5;}
	static getStartingCols() {return 5;}

	private static getGroundTemplate(): PlacedItemTemplate {
		const template = placeholderItemTemplates.getPlacedItemTemplateByName('ground');
		if (!template) throw new Error(`Error: Ground Template Does Not Exist!`);
		return template!;
	}

	constructor(userId: string = "Dummy User", rows: number = Garden.getStartingRows(), cols: number = Garden.getStartingCols(), plots: Plot[][] | null = null) {
		this.userId = userId;
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
		const { userId, plots: plainPlots } = plainObject;

		if (!Array.isArray(plainPlots)) {
			//if plots is not the right shape, throw away the entire thing
			return new Garden(userId, Garden.getStartingRows(), Garden.getStartingCols(), null);
		}	
		// Convert plainPlots to Plot[][]
		const plots = plainPlots.map((row: any[]) => row.map((plot: any) => Plot.fromPlainObject(plot)));
		
		const garden = new Garden(userId, plainPlots.length, plainPlots[0]?.length || 0, plots);
		garden.updatePlotPositions();

		return garden;
		
	}

	toPlainObject(): any {

		return {
			userId: this.userId,
			plots: this.plots.map(row => row.map(plot => plot.toPlainObject()))
		};
	} 

	/**
	 * @returns the userId of the owner of the garden.
	 */
	 getUserId(): string {
		return this.userId;
	}

	/**
	 * @returns the number of rows.
	 */
	 getRows(): number {
		return this.plots.length;
	}

	/**
	 * @returns the number of columns.
	 */
	 getCols(): number {
		return this.plots[0].length;
	}

	/**
	 * @returns the plots in the garden. (modifiable)
	 */
	getPlots(): Plot[][] {
		return this.plots;
		// deep copy instead (?)
		// return this.plots.map(innerArray => innerArray.map(plot => plot.clone()));
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
		const ground = generateNewPlaceholderPlacedItem("ground", "empty");
		const newPlot = new Plot(ground, Date.now(), 0);
		return newPlot;
	}

	/**
	 * Calculates if this garden can add a row (expand column).
	 * Can only add a row if number of rows is less than 5 + (level / 5).
	 * @returns true or false
	 */
	canAddRow(user: User) : boolean {
		if (this.getRows() + 1 <= 5 + Math.floor(user.getLevel()/5)) return true;
		return false;
	}

	/**
	 * Calculates if this garden can add a column (expand row).
	 * Can only add a column if number of columns is less than 5 + (level / 5).
	 * @returns true or false
	 */
	canAddColumn(user: User) : boolean {
		if (this.getCols() + 1 <= 5 + Math.floor(user.getLevel()/5)) return true;
		return false;
	}

	/**
 	 * Adds an additional row to the garden.
	 * @returns success or failure
	 */
	addRow(user: User): boolean {
		if (!this.canAddRow(user)) return false;
		this.setGardenSize(this.getRows() + 1, this.getCols());
		return true;
	}

	/**
 	 * Adds an additional column to the garden.
	 * @returns success or failure
	 */
	addColumn(user: User): boolean {
		if (!this.canAddColumn(user)) return false;
		this.setGardenSize(this.getRows(), this.getCols() + 1);
		return true;
	}


	//TODO: Make this add decorations back to your inventory as blueprints
	/**
 	 * Removes a row from the garden. Items in that row are destroyed!
	 * @returns success or failure
	 */
	removeRow(): boolean {
		if (this.getRows() <= 1) return false;
		this.setGardenSize(this.getRows() - 1, this.getCols());
		return true;
	}

	/**
 	 * Removes a column from the garden. Items in that row are destroyed!
	 * @returns success or failure
	 */
	removeColumn(): boolean {
		if (this.getCols() <= 1) return false;
		this.setGardenSize(this.getRows(), this.getCols() - 1);
		return true;
	}

	/**
 	 * Sets the garden size. Fills empty slots with Empty Plots, and deletes slots that are out of bounds.
	 * @rows new number of rows
	 * @cols new number of columns
	 */
	setGardenSize(rows: number, cols: number): void {
		const newPlots = Array.from({ length: rows }, (_, rowIndex) =>
			Array.from({ length: cols }, (_, colIndex) =>
				this.plots[rowIndex]?.[colIndex] || Garden.generateEmptyPlot(rowIndex, colIndex)
			)
		);
		this.plots = newPlots;
		this.fillNullWithEmptyPlot(rows, cols);
	}

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
	 * Checks if the given row and column indexes are valid.
	 */
	private isValidIndex(row: number, col: number): boolean {
		return row >= 0 && row < this.plots.length && col >= 0 && col < this.plots[row].length;
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
	harvestPlot(plot: {row: number, col: number} | Plot, replacementItem: PlacedItem = new EmptyItem(Garden.getGroundTemplate(), '')): GardenTransactionResponse {
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
	repackagePlot(plot: {row: number, col: number} | Plot, replacementItem: PlacedItem = new EmptyItem(Garden.getGroundTemplate(), '')): GardenTransactionResponse {
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