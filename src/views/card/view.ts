import { ItemView, setIcon, WorkspaceLeaf } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { renderCardView } from "./render/_render";
import DynamicInterfacePlugin from "main";
import { getEntitySchema } from "src/utils/entity-schema-manager";
import { ModalSchemaForm } from "src/modal/schema/modal";

export const CARD_VIEW_TYPE = "card-view";

// TODO make page dynamically updates

export class CardView extends ItemView {
	plugin: DynamicInterfacePlugin;
	currentFolder: string

	constructor(leaf: WorkspaceLeaf, plugin: DynamicInterfacePlugin, currentFolder: string) {
		super(leaf);
		this.plugin = plugin;
		this.currentFolder = currentFolder
	}

	getViewType() {
		return CARD_VIEW_TYPE;
	}

	getDisplayText() {
		return "Card View";
	}

	async onOpen() {
		if (!this.currentFolder) {
			const { contentEl } = this
			const wrapper = contentEl.createDiv({ cls: 'no-view' })
			wrapper.createEl('h2', { text: '🦒There is no entity schema save in the memory!' })
			wrapper.createEl('strong', { text: 'Do you want to create one in the current folder?' })
			const btn = wrapper.createEl('button', { cls: 'delete-icon', text: 'Create Entity Schema' })
			btn.onclick = () => new ModalSchemaForm(this.app).open();
		} else {
			this.render()
		}
	}

	async onClose() {
		// Clean up if needed
	}

	setFolder(folder: string) {
		this.currentFolder = folder;
		this.render();
	}

	async render() {
		const { contentEl } = this;
		const entityData = await getEntitySchema(this.app, this.currentFolder)
		if (!entityData) return

		contentEl.empty();
		contentEl.createEl("h2", { text: `Hello! You are seeing data of ${entityData?.entity} vault` });

		const btnHeaderContainer = contentEl.createDiv({ cls: 'btn-container' })
		const btns = [
			{ icon: "update", text: "Update View", fn: () => this.render() },
			{ icon: "plus", text: "Add data", fn: () => new ModalDataForm(this.app).open() },
			{ icon: "pencil", text: "Edit Entity Schema", fn: () => new ModalSchemaForm(this.app, entityData).open() }
		]

		btns.map(item => {
			const btn = btnHeaderContainer.createEl("button", { cls: "icon-button" });
			const btnIconContainer = btn.createSpan();
			setIcon(btnIconContainer, item.icon);
			btnIconContainer.style.marginRight = "0.5em";
			btn.createSpan({ text: item.text });
			btn.onclick = async () => {
				item.fn()
			}
		})
		renderCardView(this.app, contentEl, this.plugin)

	}
}

//https://github.com/login?return_to=%2Fobsidianmd%2Fobsidian-sample-plugin
