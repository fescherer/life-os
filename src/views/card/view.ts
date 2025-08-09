import { ItemView, setIcon, WorkspaceLeaf } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { renderCardView } from "./render/_render";
import DynamicInterfacePlugin from "main";
import { getEntityData } from "src/utils/entity-data-manager";
import { getEntitySchema } from "src/utils/entity-schema-manager";

export const CARD_VIEW_TYPE = "card-view";

// TODO make page dynamically updates

export class CardView extends ItemView {
	plugin: DynamicInterfacePlugin;

	constructor(leaf: WorkspaceLeaf, plugin: DynamicInterfacePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return CARD_VIEW_TYPE;
	}

	getDisplayText() {
		return "Card View";
	}

	async onOpen() {
		this.render()
	}

	async onClose() {
		// Clean up if needed
	}

	async render() {
		const { contentEl } = this;
		const entityData = await getEntitySchema(this.app)

		contentEl.empty();
		contentEl.createEl("h2", { text: `Hello! You are seeing data of ${entityData?.entity} vault` });

		const btnHeaderContainer = contentEl.createDiv({ cls: 'btn-container' })
		const btns = [
			{ icon: "update", text: "Update View", fn: this.render },
			{ icon: "plus", text: "Add data", fn: new ModalDataForm(this.app).open },
			{
				icon: "pencil", text: "Edit Entity Schema", fn: () => {
					// Editing entity brings a lot of problems, like, what I am gonna do with the camps that are changed? I am gonna delete those?
					// new ModalForm(app, async (isValid, result) => {
					// 	if (isValid) updateEntityFolder(app, result)
					// }, entitySchema).open();
				}
			}
		].map(item => {
			const btn = btnHeaderContainer.createEl("button", { cls: "icon-button" });
			const btnIconContainer = btn.createSpan();
			setIcon(btnIconContainer, item.icon);
			btnIconContainer.style.marginRight = "0.5em";
			btn.createSpan({ text: item.text });
			btn.onclick = () => {
				item.fn()
			}
		})

	}
}

//https://github.com/login?return_to=%2Fobsidianmd%2Fobsidian-sample-plugin
