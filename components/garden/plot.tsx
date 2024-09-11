import { Plot } from "@/models/garden/Plot";
import { ItemSubtypes } from "@/models/items/ItemTypes";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useGarden } from "@/app/hooks/contexts/GardenContext";
import { Plant } from "@/models/items/placedItems/Plant";
import PlotTooltip from "./plotTooltip";
import colors from "../colors/colors";

type PlotComponentProps = {
	plot: Plot;
	onPlotClick: (() => Promise<string>) | (() => string);
	currentTime: number;
  };

export interface PlotComponentRef {
	plot: Plot;
	click: () => void;
	currentTime: number;
}

const PlotComponent = forwardRef<PlotComponentRef, PlotComponentProps>(({plot, onPlotClick, currentTime}, ref) => {
	PlotComponent.displayName = "Plot";
	const { garden } = useGarden();
	const [displayIcon, setDisplayIcon] = useState(plot.getItem().itemData.icon);

	const getColor = () => {
		if (plot.getItemSubtype() === ItemSubtypes.GROUND.name) {
			return `border ${colors.ground.plotBackgroundColor} ${colors.ground.defaultBorderColor}`;
		} else if (plot.getItemSubtype() === ItemSubtypes.PLANT.name) {
			const plant = plot.getItem() as Plant;
			const timeElapsed = Date.now() - plot.getPlantTime();
			const growTime = plot.getTotalGrowTime();
			// const growTime = plant.itemData.growTime;
			if (growTime * 1000 <= timeElapsed) {
				return `bg-apple-500 border ${colors.plant.grownBorderColor}`;
			} else if (growTime * 3/4 * 1000 <= timeElapsed) {
				return `bg-apple-400 border ${colors.plant.defaultBorderColor}`;
			} else if (growTime/2 * 1000 <= timeElapsed) {
				return `bg-apple-300 border ${colors.plant.defaultBorderColor}`;
			} else if (growTime * 1/4 * 1000 <= timeElapsed) {
				return `bg-apple-200 border ${colors.plant.defaultBorderColor}`;
			} else {
				return `bg-apple-100 border ${colors.plant.defaultBorderColor}`;
			}

		} else if (plot.getItemSubtype() === ItemSubtypes.DECORATION.name) {
			return `border ${colors.decoration.plotBackgroundColor} ${colors.decoration.defaultBorderColor}`;
		} else {
			//should never occur
			return `bg-gray-300 border ${colors.plant.defaultBorderColor}`;
		}
	}

	const [color, setColor] = useState(() => getColor());

	useImperativeHandle(ref, () => ({
		click() {
			handleClick();
		},
		plot,
		currentTime
	}));

	const currentItem = plot.getItem();
	const currentPlantTime = plot.getPlantTime();

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		setColor(getColor());
  
		if (plot.getItemSubtype() === ItemSubtypes.PLANT.name) {
		  interval = setInterval(() => {
			setColor(getColor());
		  }, 1000);
		}
  
		return () => {
		  if (interval) {
			clearInterval(interval);
		  }
		};
	  }, [currentItem, currentPlantTime, plot]);

	const handleClick = async () => {
		//onPlotClick comes from plotActions which may/may not be async
		const updatedIcon = await onPlotClick();
		if (displayIcon != updatedIcon) {
			setDisplayIcon(updatedIcon);
		}
	}


	return (
		<PlotTooltip plot={plot} currentTime={currentTime}>
			<button onClick={handleClick} className={`flex items-center justify-center text-4xl ${color} w-12 h-12 text-purple-600 font-semibold hover:text-white hover:bg-purple-600 hover:border-transparent`} data-testid="plot">{displayIcon}</button>
		</PlotTooltip>
	  );
});

export default PlotComponent;