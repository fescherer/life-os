// in main.ts
import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { ModalSchemaForm } from "src/modal/schema/modal";
import { getCurrentFolder } from "src/utils/folderName";
import { CARD_VIEW_TYPE, CardView } from "src/views/card/view";

export default class DynamicInterfacePlugin extends Plugin {
	async onload() {
		this.registerView(
			CARD_VIEW_TYPE,
			(leaf) => new CardView(leaf, this)
		);

		this.addRibbonIcon("dice", "Activate view", async () => {
			const currentFolder = await getCurrentFolder(this.app);
			if (!currentFolder) {
				new Notice("No data schema found");
				return;
			}

			// 👉 Check if a CardView for this folder already exists
			const existingLeaf = this.app.workspace.getLeavesOfType(CARD_VIEW_TYPE)
				.find((leaf) => {
					const view = leaf.view as CardView;
					return view.currentFolder === currentFolder;
				});

			if (existingLeaf) {
				// focus existing tab
				this.app.workspace.setActiveLeaf(existingLeaf, { focus: true });
				return;
			}

			// Otherwise, create a new one
			const leaf = this.app.workspace.getLeaf(true);
			await leaf.setViewState({
				type: CARD_VIEW_TYPE,
				active: true,
				state: { currentFolder },
			});
		});

		this.addRibbonIcon("table", "Create new schema", () => {
			new ModalSchemaForm(this.app).open();
		});

		this.addRibbonIcon("newspaper", "Create new data block", () => {
			new ModalDataForm(this.app).open();
		});
	}
}