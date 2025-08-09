import { CardInteractionManager } from "../card-interation";
import DynamicInterfacePlugin from "main";
import { Card } from "../card";
import { getEntitySchema } from "src/utils/entity-schema-manager";
import { getEntityData } from "src/utils/entity-data-manager";
import { App } from "obsidian";

export async function renderCardView(app: App, contentEl: HTMLElement, plugin: DynamicInterfacePlugin) {
	const entitySchema = await getEntitySchema(app)
	const entityData = await getEntityData(app)
	if (!entityData || !entitySchema) return;

	const cardContainer = contentEl.createDiv({ cls: 'card-container' })
	plugin.interactionManager = new CardInteractionManager(app, cardContainer);

	entityData.data.map(async (data) => {
		const card = new Card(app, data, cardContainer, entitySchema)
		card.render()
	})
}


