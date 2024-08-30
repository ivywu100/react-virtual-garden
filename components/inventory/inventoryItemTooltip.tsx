import { Blueprint } from "@/models/items/inventoryItems/Blueprint";
import { HarvestedItem } from "@/models/items/inventoryItems/HarvestedItem";
import { InventoryItem } from "@/models/items/inventoryItems/InventoryItem";
import { Seed } from "@/models/items/inventoryItems/Seed";
import { ItemSubtypes } from "@/models/items/ItemTypes";
import { HarvestedItemTemplate } from "@/models/items/templates/models/HarvestedItemTemplate";
import { placeholderItemTemplates } from "@/models/items/templates/models/PlaceholderItemTemplate";
import { PlantTemplate } from "@/models/items/templates/models/PlantTemplate";
import colors from "../colors/colors";
import Tooltip from "../window/tooltip";

const InventoryItemTooltip = ({ children, item }: { children: React.ReactNode, item: InventoryItem}) => {

	const RenderItemTooltipInfo = () => {
		switch(item.itemData.subtype) {
			case ItemSubtypes.SEED.name:
				return RenderSeedTooltip();
			case ItemSubtypes.HARVESTED.name:
				return RenderHarvestedTooltip();
			case ItemSubtypes.BLUEPRINT.name:
				return RenderBlueprintTooltip();
			default:
				return RenderEmptyItemTooltip();
		}
	}

	//Can pull this out to a separate file if we ever need multiple formats for tooltips
	const RenderSeedTooltip = () => {
		const currentItem = item as Seed;
		const plantedItem = placeholderItemTemplates.getPlacedTemplate(currentItem.itemData.transformId);
		if (!plantedItem || plantedItem.subtype !== ItemSubtypes.PLANT.name) return <></>;
		const plantTemplate = plantedItem as PlantTemplate;
		const harvestedItem = placeholderItemTemplates.getInventoryTemplate(plantedItem.transformId);
		if (!harvestedItem|| harvestedItem.subtype !== ItemSubtypes.HARVESTED.name) return <></>;
		const harvestedTemplate = harvestedItem as HarvestedItemTemplate;
		if (currentItem.itemData.name === 'error') {
			return <>
				<div> An error occurred! Please report this to the developers.</div>
			</>
		}

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

	const RenderHarvestedTooltip = () => {
		const currentItem = item as HarvestedItem;

		return <>
		<div className="flex flex-col items-left min-w-0 flex-grow">
			<div className="flex flex-row justify-between flex-grow min-w-max">
				<div className="flex flex-row">
					<span className="w-6">{currentItem.itemData.icon}</span>
					{/* Might not display properly if screen size is small or name is too long */}
					<span>{currentItem.itemData.name}</span>
				</div>
				<span className="ml-2 flex ">
					<span className="">💰</span> {/* Gold icon */}
					{currentItem.itemData.value}
				</span>
			</div>
			<div className={`${colors.harvested.categoryTextColor} text-left`}>Harvested</div>
			<div className={`${colors.harvested.categoryTextColor} text-left`}>Category: {currentItem.itemData.category}</div>
		</div>
	</>
	}

	const RenderBlueprintTooltip = () => {
		const currentItem = item as Blueprint;
		const decoration = placeholderItemTemplates.getPlacedTemplate(currentItem.itemData.transformId);
		if (!decoration) return <></>;
		if (currentItem.itemData.name === 'error') {
			return <>
				<div> An error occurred! Please report this to the developers.</div>
			</>
		}

		return <>
			<div className="flex flex-col items-left min-w-0 flex-grow">
				<div className="flex flex-row justify-between min-w-max">
					<div className="flex flex-row">
						<span className="w-6">{currentItem.itemData.icon}</span>
						{/* Might not display properly if screen size is small or name is too long */}
						<span>{currentItem.itemData.name}</span>
					</div>
					<span className="ml-2 flex ">
						<span className="">💰</span> {/* Gold icon */}
						{currentItem.itemData.value}
					</span>
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
		return <>hello world</>;
	}

	const getBackgroundColor = () => {
		switch(item.itemData.subtype) {
			case ItemSubtypes.SEED.name:
				return colors.seed.inventoryTooltipBackground;
			case ItemSubtypes.HARVESTED.name:
				return colors.harvested.inventoryTooltipBackground;
			case ItemSubtypes.BLUEPRINT.name:
				return colors.blueprint.inventoryTooltipBackground;
			default:
				return "bg-gray-300";
		}
	}

	// const showTooltip = plot.getItemSubtype() === ItemSubtypes.GROUND.name ? 'OFF' : 'ON';

	return (
		<div className="w-full">
			<Tooltip content={RenderItemTooltipInfo()} position="top" backgroundColor={getBackgroundColor()} forceVisible={""} boxWidth={"300px"}>
				{children}
			</Tooltip>
		</div>
		);
}

export default InventoryItemTooltip;