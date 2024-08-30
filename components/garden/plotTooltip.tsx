import { useSelectedItem } from "@/hooks/contexts/SelectedItemContext";
import { Plot } from "@/models/garden/Plot";
import { Blueprint } from "@/models/items/inventoryItems/Blueprint";
import { Seed } from "@/models/items/inventoryItems/Seed";
import { ItemSubtypes } from "@/models/items/ItemTypes";
import { Plant } from "@/models/items/placedItems/Plant";
import { HarvestedItemTemplate } from "@/models/items/templates/models/HarvestedItemTemplate";
import { placeholderItemTemplates } from "@/models/items/templates/models/PlaceholderItemTemplate";
import { PlantTemplate } from "@/models/items/templates/models/PlantTemplate";
import React, { useEffect, useState } from "react";
import colors from "../colors/colors";
import Tooltip from "../window/tooltip";

const PlotTooltip = ({ children, plot, currentTime }: { children: React.ReactNode, plot: Plot, currentTime: number}) => {

	const {selectedItem} = useSelectedItem();

	const RenderPlotTooltipInfo = () => {
		const currentItem = plot.getItem();
		switch(currentItem.itemData.subtype) {
			case ItemSubtypes.GROUND.name:
				return RenderEmptyItemTooltip();
			case ItemSubtypes.DECORATION.name:
				return RenderDecorationTooltip();
			case ItemSubtypes.PLANT.name:
				return RenderPlantTooltip();
			default:
				return RenderEmptyItemTooltip();
		}
	}

	//Can pull this out to a separate file if we ever need multiple formats for tooltips
	const RenderPlantTooltip = () => {
		const currentItem = plot.getItem() as Plant;
		const harvestedItem = placeholderItemTemplates.getInventoryTemplate(currentItem.itemData.transformId);
		if (!harvestedItem) return <></>;
		if (currentItem.itemData.name === 'error') {
			return <>
				<div> An error occurred! Please report this to the developers.</div>
			</>
		}

		return (<>
			<div className="flex flex-col items-left min-w-0 flex-grow" data-testid="tool-tip">
				<div className="flex flex-row justify-between flex-grow min-w-max">
					<div className="flex flex-row min-w-0">
						<span className="w-6">{currentItem.itemData.icon}</span>
						{/* Might not display properly if screen size is small or name is too long */}
						<span data-testid="tool-name">{currentItem.itemData.name}</span>
					</div>
					<span className="ml-2 flex " data-testid="tool-sell-price">
						<span className="">💰</span> {/* Gold icon */}
						{harvestedItem.value}
					</span>
				</div>
				<div className={`${colors.harvested.categoryTextColor} text-left`} data-testid="tool-category">Plant</div>
				<div className={`${colors.harvested.categoryTextColor} text-left`} data-testid="tool-category-type">Category: {currentItem.itemData.category}</div>
				<div data-testid="tool-status">{plot.getRemainingGrowTime(currentTime)}</div>
				<div data-testid="tool-xp-gained">XP Gained: {currentItem.itemData.baseExp}</div>
				<div>Harvests Remaining: {plot.getUsesRemaining()}</div>
			</div>
		</>);
	}

	const RenderDecorationTooltip = () => {
		const currentItem = plot.getItem();
		const blueprint = placeholderItemTemplates.getInventoryTemplate(currentItem.itemData.transformId);
		if (!blueprint) return <></>;
		if (currentItem.itemData.name === 'error') {
			return <>
				<div> An error occurred! Please report this to the developers.</div>
			</>
		}

		return  <>
		<div className="flex flex-col items-left min-w-0 flex-grow">
			<div className="flex flex-row justify-between flex-grow min-w-max">
				<div className="flex flex-row min-w-0">
					<span className="w-6">{currentItem.itemData.icon}</span>
					{/* Might not display properly if screen size is small or name is too long */}
					<span>{currentItem.itemData.name}</span>
				</div>
				{/* <span className="ml-2 flex ">
						<span className="">💰</span>
						{blueprint.value}
					</span> */}
			</div>
			<div className={`${colors.decoration.categoryTextColor} text-left`}>Decoration</div>
		</div>
	</>
	}

	const RenderEmptyItemTooltipWithSeedSelected = () => {
		const emptyItem = plot.getItem();
		if (emptyItem.itemData.name === 'error' || !selectedItem) {
			return <>
				<div> An error occurred! Please report this to the developers.</div>
			</>
		}
		const currentItem = selectedItem as Seed;
		const plantedItem = placeholderItemTemplates.getPlacedTemplate(currentItem.itemData.transformId);
		if (!plantedItem || plantedItem.subtype !== ItemSubtypes.PLANT.name) return <></>;
		const plantTemplate = plantedItem as PlantTemplate;
		const harvestedItem = placeholderItemTemplates.getInventoryTemplate(plantedItem.transformId);
		if (!harvestedItem|| harvestedItem.subtype !== ItemSubtypes.HARVESTED.name) return <></>;
		const harvestedTemplate = harvestedItem as HarvestedItemTemplate;

		return <>
		<div className="flex flex-col items-left min-w-0 flex-grow">
			<div className="flex flex-row justify-between min-w-max">
				<div className="flex flex-row min-w-0">
					<span className="w-6 flex-shrink-0">{currentItem.itemData.icon}</span>
					{/* Might not display properly if screen size is small or name is too long */}
					<span>{currentItem.itemData.name}</span>
				</div>
				<span className="ml-2 flex ">
					<span className="">💰</span> {/* Gold icon */}
					{currentItem.itemData.value}
				</span>
			</div>
			<div className={`${colors.blueprint.categoryTextColor} text-left`}>Seed</div>
			<div className={`${colors.harvested.categoryTextColor} text-left`}>Category: {currentItem.itemData.category}</div>
			<div>When planted: </div>
			<div className="flex flex-row justify-between">
				<div className="flex flex-row">
					<span className="w-6">{plantedItem.icon}</span>
					{/* Might not display properly if screen size is small or name is too long */}
					<span>{plantedItem.name}</span>
				</div>
				<span className="ml-2 flex ">
					<span className="">💰</span> {/* Gold icon */}
					{harvestedItem.value}
				</span>
			</div>
			<div>{plantTemplate.numHarvests === 1 ? `1 harvest` : plantTemplate.numHarvests.toString() + ' harvests'}</div>
			<div>{plantTemplate.getGrowTimeString()}</div>
			<div>XP Gained: {plantTemplate.baseExp}</div>
		</div>
	</>
	}

	const RenderEmptyItemTooltipWithBlueprintSelected = () => {
		const emptyItem = plot.getItem();
		if (emptyItem.itemData.name === 'error' || !selectedItem) {
			return <>
				<div> An error occurred! Please report this to the developers.</div>
			</>
		}
		const currentItem = selectedItem as Blueprint;
		const decoration = placeholderItemTemplates.getPlacedTemplate(currentItem.itemData.transformId);
		if (!decoration) return <></>;
		if (currentItem.itemData.name === 'error') {
			return <>
				<div> An error occurred! Please report this to the developers.</div>
			</>
		}

		return <>
			<div className="flex flex-col items-left min-w-0 flex-grow">
				<div>Placing: </div>
				<div className="flex flex-row justify-between min-w-max">
					<div className="flex flex-row">
						<span className="w-6">{currentItem.itemData.icon}</span>
						{/* Might not display properly if screen size is small or name is too long */}
						<span>{currentItem.itemData.name}</span>
					</div>
					{/* Removed gold icon for clutter */}
					{/* 
						<span className="ml-2 flex ">
							<span className="">💰</span> 
							{currentItem.itemData.value}
						</span>
					*/}
				</div>
				<div className={`${colors.blueprint.categoryTextColor} text-left`}>Blueprint</div>
				<div>When placed: </div>
				<div className="flex flex-row">
					<span className="w-6">{decoration.icon}</span>
					{/* Might not display properly if screen size is small or name is too long */}
					<span>{decoration.name}</span>
				</div>
			</div>
		</>
	}

	const RenderEmptyItemTooltip = () => {
		const currentItem = plot.getItem();
		if (currentItem.itemData.name === 'error' || !selectedItem) {
			return <>
				<div> An error occurred! Please report this to the developers.</div>
			</>
		}
		if (selectedItem.itemData.subtype === ItemSubtypes.SEED.name) {
			return RenderEmptyItemTooltipWithSeedSelected();
		}
		if (selectedItem.itemData.subtype === ItemSubtypes.BLUEPRINT.name) {
			return RenderEmptyItemTooltipWithBlueprintSelected();
		}

		return  <>
		<div className="flex flex-col items-left min-w-0 flex-grow">
			<div className="flex flex-row justify-between flex-grow min-w-max">
				<div>
					<span>Empty Plot</span>
				</div>
			</div>
		</div>
	</>
	}

	const getBackgroundColor = () => {
		const currentItem = plot.getItem();
		switch(currentItem.itemData.subtype) {
			case ItemSubtypes.DECORATION.name:
				return colors.decoration.plotTooltipBackground;
			case ItemSubtypes.PLANT.name:
				return colors.plant.plotTooltipBackground;
			case ItemSubtypes.GROUND.name:
				if (selectedItem && selectedItem.itemData.subtype === ItemSubtypes.SEED.name) {
					return colors.plant.plotTooltipBackground;
				} else if (selectedItem && selectedItem.itemData.subtype === ItemSubtypes.BLUEPRINT.name) {
					return colors.decoration.plotTooltipBackground;
				} else {
					return colors.ground.plotTooltipBackground;
				}
			default:
				return colors.ground.plotTooltipBackground;
		}
	}

	// const showTooltip = plot.getItemSubtype() === ItemSubtypes.GROUND.name ? 'OFF' : '';

	const shouldShowTooltip = () => {
		if (plot.getItemSubtype() === ItemSubtypes.DECORATION.name || plot.getItemSubtype() === ItemSubtypes.PLANT.name) {
			return '';
		}
		if (plot.getItemSubtype() === ItemSubtypes.GROUND.name && selectedItem && (selectedItem.itemData.subtype === ItemSubtypes.SEED.name)) {
			return '';
		}
		if (plot.getItemSubtype() === ItemSubtypes.GROUND.name && selectedItem && (selectedItem.itemData.subtype === ItemSubtypes.BLUEPRINT.name)) {
			return '';
		}

		return 'OFF';
	}

	return (
		<Tooltip content={RenderPlotTooltipInfo()} position="top" backgroundColor={getBackgroundColor()} forceVisible={shouldShowTooltip()} boxWidth={'20vw'}>
			{children}
		</Tooltip>);
}

export default PlotTooltip;