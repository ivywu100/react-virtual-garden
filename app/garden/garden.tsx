import PlotComponent, { PlotComponentRef } from "@/components/garden/plot";
import { Plot } from "@/models/garden/Plot";
import { InventoryItem } from "@/models/items/inventoryItems/InventoryItem";
import { ItemSubtypes } from "@/models/items/ItemTypes";
import React, { useEffect, useRef, useState } from "react";
import { useInventory } from "@/hooks/contexts/InventoryContext";
import { useGarden } from "@/hooks/contexts/GardenContext";
import LevelSystemComponent from "@/components/level/LevelSystem";
import { saveGarden } from "@/utils/localStorage/garden";
import { usePlotActions } from "@/hooks/garden/plotActions";
import { useSelectedItem } from "@/hooks/contexts/SelectedItemContext";
import { useUser } from "@/hooks/contexts/UserContext";

const GardenComponent = () => {
	const { inventory } = useInventory();
	const { garden, gardenMessage, setGardenMessage } = useGarden();
	const { user } = useUser();
	const {selectedItem, toggleSelectedItem} = useSelectedItem();
	const [gardenForceRefreshKey, setGardenForceRefreshKey] = useState(0);
	const [instantGrow, setInstantGrow] = useState(false); //for debug purposes
	const plotRefs = useRef<PlotComponentRef[][]>(garden.getPlots().map(row => row.map(() => null!)));

	const [currentTime, setCurrentTime] = useState(Date.now());
	// const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
	useEffect(() => {
		const id = setInterval(() => {
			// Update currentTime
			setCurrentTime(Date.now());
		}, 1000); // Update every second
		// setIntervalId(id);
		return () => clearInterval(id); // Cleanup function to clear the interval on unmount
	}, []);

	const GetPlotAction = (plot: Plot, selected: InventoryItem | null) => {
		const {plantSeed, placeDecoration, clickPlant, clickDecoration, doNothing} = usePlotActions();
		if (plot.getItemSubtype() == ItemSubtypes.GROUND.name && selected != null) {
			if (selected.itemData.subtype == ItemSubtypes.SEED.name) {
				return plantSeed(selected, plot);
			} else if (selected.itemData.subtype == ItemSubtypes.BLUEPRINT.name) {
				return placeDecoration(selected, plot);
			}
		}
		if (plot.getItemSubtype() == ItemSubtypes.PLANT.name) {
			return clickPlant(plot, instantGrow);
		}
		if (plot.getItemSubtype() == ItemSubtypes.DECORATION.name) {
			return clickDecoration(plot);
		}
		return doNothing(plot);
	}

	const generatePlots = (plots: Plot[][]) => {
		return (
			<>
			<div className="flex flex-col flex-wrap max-w-[100%]" data-testid="garden-plots">
			{plots.map((row, rowIndex) => (
				<div className="flex flex-nowrap" key={rowIndex}>
					{row.map((plot, colIndex) => {
						const index = rowIndex * plots.length + colIndex;
						if (plotRefs.current.length <= rowIndex) {
							//If plotRefs is not big enough, we expand it first.
							//Note that we never shrink plotRefs, but it'll be null and 
							//cleaned up once the user save/loads by switching pages.
							plotRefs.current[rowIndex] = [];
						}
						return (
							<PlotComponent 
								key={index} 
								ref={el => {plotRefs.current[rowIndex][colIndex] = el!}}
								plot={plot} 
								onPlotClick={GetPlotAction(plot, selectedItem)} 
								currentTime={currentTime}
							/>
						);
					})}
				</div>
				)
			)}
			</div>
			</>
		);
	}

	const plantAll = ()  => {
		if (selectedItem == null || selectedItem.itemData.subtype != ItemSubtypes.SEED.name) return;
		const getItemResponse = inventory.getItem(selectedItem);
		if (!getItemResponse.isSuccessful()) return;
		let numRemaining = getItemResponse.payload.getQuantity();
		let numPlanted = 0;
		for (const row of plotRefs.current) {
			for (const plotRef of row) {
				if (plotRef && plotRef.plot.getItemSubtype() === ItemSubtypes.GROUND.name) {
					plotRef.click();
					numPlanted++;
					numRemaining--;
					if (numRemaining <= 0) {
						return;
					}
				}
			}
		}
		setGardenMessage(`Planted ${numPlanted} ${getItemResponse.payload.itemData.name}.`);
	}

	const harvestAll = () => {
		let currentPlants = 0;
		for (let i = 0; i < garden.getRows(); i++) {
			for (let j = 0; j < garden.getCols(); j++) {
				if (garden.getPlotByRowAndColumn(i, j)?.getItemSubtype() === ItemSubtypes.PLANT.name) {
					currentPlants++;
				}
			}
		}
		plotRefs.current.forEach(row => {
			row.forEach(plotRef => {
			  if (plotRef && plotRef.plot.getItemSubtype() === ItemSubtypes.PLANT.name) {
				plotRef.click();
			  }
			});
		  });

		let newCurrentPlants = 0;
		for (let i = 0; i < garden.getRows(); i++) {
			for (let j = 0; j < garden.getCols(); j++) {
				if (garden.getPlotByRowAndColumn(i, j)?.getItemSubtype() === ItemSubtypes.PLANT.name) {
					newCurrentPlants++;
				}
			}
		}
		setGardenMessage(`Harvested ${currentPlants - newCurrentPlants} plants.`);
	}


	function expandRow() {
		if (!garden || !user) {
			return;
		}
		garden.addColumn(user);
		saveGarden(garden);
		setGardenForceRefreshKey((gardenForceRefreshKey) => gardenForceRefreshKey + 1);
	}

	function expandCol() {
		if (!garden || !user) {
			return;
		}
		garden.addRow(user);
		saveGarden(garden);
		setGardenForceRefreshKey((gardenForceRefreshKey) => gardenForceRefreshKey + 1);
	}

	function shrinkRow() {
		if (!garden) {
			return;
		}
		garden?.removeColumn();
		saveGarden(garden);
		setGardenForceRefreshKey((gardenForceRefreshKey) => gardenForceRefreshKey + 1);
	}

	function shrinkCol() {
		if (!garden) {
			return;
		}
		garden?.removeRow();
		saveGarden(garden);
		setGardenForceRefreshKey((gardenForceRefreshKey) => gardenForceRefreshKey + 1);
	}

	// function levelUp() {
	// 	if (!garden) {
	// 		return;
	// 	}
	// 	garden.addExp(garden.getExpToLevelUp());
	// 	saveGarden(garden);
	// 	setGardenForceRefreshKey((gardenForceRefreshKey) => gardenForceRefreshKey + 1);
	// }

	function toggleInstantGrow() {
		//Yes this is reversed, because instantGrow hasn't updated until the next render
		setGardenMessage(`instant grow is now: ${!instantGrow ? `on` : `off`}`);
		setInstantGrow((instantGrow) => !instantGrow);
	}

	return (
		<>
		<div className="min-h-8">{gardenMessage}</div>
		<div key={gardenForceRefreshKey} className=" px-2 py-2 flex flex-col items-center mx-2">
			<div className="overflow-x-auto max-w-full py-1">
				{generatePlots(garden.getPlots())}
			</div>
		</div>
		<div>
			<button onClick={plantAll} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`} data-testid="plant-all">Plant All</button>
			<button onClick={harvestAll} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`} data-testid="harvest-all">Harvest All</button>
		</div>
		<div>
			<button onClick={expandRow} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`} data-testid="expand-row">expand row</button>
			<button onClick={expandCol} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`} data-testid="expand-col">expand col</button>
			{/* <button onClick={levelUp} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>levelup (debug)</button> */}
		</div>
		<div>
			<button onClick={shrinkRow} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`} data-testid="shrink-row">shrink row</button>
			<button onClick={shrinkCol} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`} data-testid="shrink-col">shrink col</button>
		</div>
		<div>
			<button onClick={toggleInstantGrow} className={`bg-gray-300 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}>toggle instant harvest mode (debug)</button>
		</div>
     	</>
	);
}

export default GardenComponent;