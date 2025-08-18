import { Plugin } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { ModalSchemaForm } from "src/modal/schema/modal";
import { DEFAULT_SETTINGS, TPluginSettings } from "src/types/util";
import { getCurrentFolder } from "src/utils/folderName";
import { CardInteractionManager } from "src/views/card/card-interation";
import { CARD_VIEW_TYPE, CardView } from "src/views/card/view";


export default class DynamicInterfacePlugin extends Plugin {
	interactionManager: CardInteractionManager;
	settings: TPluginSettings;




	async onload() {
		await this.loadSettings();

		// Example: use the value
		console.log("Config value:", this.settings.currentFolderToView);

		console.warn("Loading Fennec Tales Studio's Plugin");

		this.registerView(
			CARD_VIEW_TYPE,
			(leaf) => new CardView(leaf, this, this.settings.currentFolderToView)
		);

		this.addRibbonIcon('dice', 'Activate view', async () => {
			const currentFolder = await getCurrentFolder(this.app)
			if (currentFolder) {
				this.settings.currentFolderToView = currentFolder
				await this.saveSettings();


				// Optionally refresh the current CardView
				const leaves = this.app.workspace.getLeavesOfType(CARD_VIEW_TYPE);
				for (const leaf of leaves) {
					const view = leaf.view as CardView;
					view.setFolder(currentFolder); // You’d implement this in your CardView
				}
			}

			const leaf = this.app.workspace.getLeaf(true);
			await leaf.setViewState({
				type: CARD_VIEW_TYPE,
				active: true
			});
		});

		this.addRibbonIcon("table", "Create new schema", async () => {
			new ModalSchemaForm(this.app).open();
		})

		this.addRibbonIcon("newspaper", "Create new data block", () => {
			new ModalDataForm(this.app).open();
		})
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
