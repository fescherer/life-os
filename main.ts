import { Plugin } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { ModalForm } from "src/modal/schema/modal";
import { TEntity } from "src/types/field";
import { createEntityFolder } from "src/utils/entity-util";
import { CardInteractionManager } from "src/views/card/card-interation";
import { CARD_VIEW_TYPE, CardView } from "src/views/card/view";


export default class DynamicInterfacePlugin extends Plugin {
	interactionManager: CardInteractionManager;

	async onload() {
		console.warn("Loading Fennec Tales Studio's Plugin");

		this.registerView(
			CARD_VIEW_TYPE,
			(leaf) => new CardView(leaf, this)
		);

		this.addRibbonIcon('dice', 'Activate view', async () => {
			const leaf = this.app.workspace.getLeaf(true);
			await leaf.setViewState({
				type: CARD_VIEW_TYPE,
				active: true
			});
		});

		this.addRibbonIcon("table", "Create new schema", async () => {
			new ModalForm(this.app, async (isValid, result) => {
				if (isValid) {
					createEntityFolder(result as TEntity)
				}
			}).open();
		})

		this.addRibbonIcon("newspaper", "Create new data block", () => {
			new ModalDataForm(this.app).open();
		})
	}
}
