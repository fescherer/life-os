import { App } from "obsidian";
import { TDataItem } from "src/types/data";
import { getEntityData } from "src/utils/entity-util";

export async function generateID(app: App, dataItem: TDataItem, entityCountID: number, defaultData?: TDataItem) {
	const entityData = await getEntityData(app);

	if (defaultData) {
		entityCountID = entityData.idCount
	} else {
		const newEntityDataIdCount = entityData.idCount + 1;
		entityCountID = newEntityDataIdCount;

		dataItem.id = newEntityDataIdCount.toString().padStart(3, '0');
	}
}
