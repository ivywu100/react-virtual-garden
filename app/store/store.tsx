import colors from "@/components/colors/colors";
import ItemStoreComponent from "@/components/itemStore/itemStore";
import { useStore } from "@/hooks/contexts/StoreContext";
import { useEffect, useState } from "react";

const StoreComponent = ({onInventoryItemClickFunction}: {onInventoryItemClickFunction: (arg: any) => void}) => {

	const {store, restockStore, resetStore} = useStore();

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

	const handleRestock = () => {
		if (Date.now() > store.getRestockTime()) {
			const response = restockStore();
			if (!response.isSuccessful()) {
				console.log('there was an error');
				return;
			}
			
			setCanRestock(false);
		} else {
			const now = Date.now();
			const calculatedTimeRemaining = Math.max(0, store.getRestockTime() - now);
			setTimeRemaining(calculatedTimeRemaining);
			if (calculatedTimeRemaining == 0) {
				setCanRestock(true);
			} else {
				setCanRestock(false);
			}
		}
	}

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

	return (
		<>
		<div className="w-[80%]">
			<div className="font-bold text-3xl">{store.getStoreName()}</div>
			<div>{RenderStoreDiscountString()}</div>
			<ItemStoreComponent itemStore={store} onInventoryItemClickFunction={onInventoryItemClickFunction} costMultiplier={store.getBuyMultiplier()} maxHeightPercentage={60}/>
			<div>
				<div className="mt-2 text-sm text-gray-600">
					{canRestock ? 'Store is fully stocked' : `Restock in: ${Math.ceil(timeRemaining / 1000)}s`}
				</div>
			</div>
			<div>
				<button
					onClick={resetStore}
					className={`bg-gray-300 px-4 py-1 mt-2 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2`}
				>
					Reset Store (Debug)
				</button>
			</div>
		</div>
		</>
	);
}

export default StoreComponent;