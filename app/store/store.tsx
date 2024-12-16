import colors from "@/components/colors/colors";
import ItemStoreComponent from "@/components/itemStore/itemStore";
import { useStore } from "@/app/hooks/contexts/StoreContext";
import { useEffect, useState } from "react";
import { getTimeString } from "@/models/utility/Time";

const StoreComponent = ({onInventoryItemClickFunction, forceRefreshKey}: {onInventoryItemClickFunction: (arg: any) => void, forceRefreshKey: number}) => {

	const {store} = useStore();

	const [timeRemaining, setTimeRemaining] = useState<number>(0);
	const [canRestock, setCanRestock] = useState<boolean>(false);

	useEffect(() => {
		const updateTimer = () => {
			const now = Date.now();
			const calculatedTimeRemaining = Math.max(0, store.getRestockTime() - now);
			setTimeRemaining(calculatedTimeRemaining);
			if (calculatedTimeRemaining == 0) {
				setCanRestock(true);
			} else {
				setCanRestock(false);
			}
		};

		// Update timer initially and set interval
		updateTimer();
		const intervalId = setInterval(updateTimer, 1000);

		// Clear interval on component unmount
		return () => {
			clearInterval(intervalId);
		}
	}, [store]);

	const RenderStoreDiscountString = () => {

		const getPriceColor = () => {
			const costMultiplier = store.getBuyMultiplier();
			if (costMultiplier > 2) {
				return colors.store.storeHighPrice;
			} else if (costMultiplier == 2) {
				return colors.store.storeRegularPrice;
			} else if (costMultiplier < 2) {
				return colors.store.storeLowPrice;
			}
			return '';
		}

		const floatToPercentageString = (float: number) => {
			const percentageValue = float * 100;
			const percentageString = percentageValue % 1 === 0 
				? percentageValue.toFixed(0) + "%" 
				: percentageValue.toFixed(1) + "%";
			return percentageString;
		}

		return <>
			<span>
				{store.getStoreName()} sells items for 
				<span className={`font-semibold ${getPriceColor()}`}> {floatToPercentageString(store.getBuyMultiplier())} </span>
				 of their base value.
			</span>
		</>
	}

	const getStoreRestockTimeString = () => {
		const time = Math.ceil(timeRemaining / 1000);
		const timeString = getTimeString(time);
		return timeString;
	}

	return (
		<>
		<div className="w-[80%]" key={forceRefreshKey}>
			<div className="font-bold text-3xl">{store.getStoreName()}</div>
			<div>{RenderStoreDiscountString()}</div>
			<ItemStoreComponent itemStore={store} onInventoryItemClickFunction={onInventoryItemClickFunction} costMultiplier={store.getBuyMultiplier()} maxHeightPercentage={60}/>
			<div>
				<div className="mt-2 text-sm text-gray-600">
					{canRestock ? 'Store is fully stocked' : `Restock in: ${getStoreRestockTimeString()}`}
				</div>
			</div>
		</div>
		</>
	);
}

export default StoreComponent;