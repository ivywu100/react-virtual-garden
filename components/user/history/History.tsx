import ActionHistoryListComponent from "./ActionHistoryList";
import ItemHistoryListComponent from "./ItemHistoryList";

const HistoryComponent = ({}) => {

	return <>
		<div>
			<ActionHistoryListComponent/>
		</div>
		<div>
			<ItemHistoryListComponent/>
		</div>
	</>
}

export default HistoryComponent;