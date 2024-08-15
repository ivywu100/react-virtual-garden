import { CustomResponse } from "../../../utility/CustomResponse";
import ActionHistory from "./ActionHistory";

export class ActionHistoryTransactionResponse extends CustomResponse {
	payload: ActionHistory | null;
	constructor(payload: ActionHistory | null = null, messages: string[] = []) {
		super(payload, messages);
		this.payload = payload;
	}
}