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

		const entitySchema = await getEntitySchema(this.app)
		const entityData = await getEntityData(this.app)
		if (!entityData || !entitySchema) return;

		contentEl.empty();
		this.renderPageHeader(contentEl, entityData.label)

		renderCardView(this.app, entityData, contentEl, entitySchema, this.render, this.plugin)

	}

	private async renderPageHeader(contentEl: HTMLElement, title: string) {
		contentEl.createEl("h2", { text: `Hello! You are seeing data of ${title} vault` });

		const btnHeaderContainer = contentEl.createDiv({ cls: 'btn-container' })

		const updateRenderView = btnHeaderContainer.createEl("button", { cls: "icon-button" });
		const updateRenderViewIcon = updateRenderView.createSpan();
		setIcon(updateRenderViewIcon, "update");
		updateRenderViewIcon.style.marginRight = "0.5em";
		updateRenderView.createSpan({ text: "Update View" });
		updateRenderView.onclick = () => {
			this.render()
		}

		const btnAddNewData = btnHeaderContainer.createEl("button", { cls: "icon-button" });
		const btnAddNewDataIcon = btnAddNewData.createSpan();
		setIcon(btnAddNewDataIcon, "plus");
		btnAddNewDataIcon.style.marginRight = "0.5em";
		btnAddNewData.createSpan({ text: "Add data" });
		btnAddNewData.onclick = () => {
			new ModalDataForm(this.app).open();
		}

		const btnEditEntitySchema = btnHeaderContainer.createEl("button", { cls: "icon-button" });
		const btnEditEntitySchemaIcon = btnEditEntitySchema.createSpan();
		setIcon(btnEditEntitySchemaIcon, "pencil");
		btnEditEntitySchemaIcon.style.marginRight = "0.5em";
		btnEditEntitySchema.createSpan({ text: "Edit Entity Schema" });
		btnEditEntitySchema.onclick = () => {
			// Editing entity brings a lot of problems, like, what I am gonna do with the camps that are changed? I am gonna delete those?
			// new ModalForm(this.app, async (isValid, result) => {
			// 	if (isValid) updateEntityFolder(this.app, result)
			// }, entitySchema).open();
		}
	}
}

//https://github.com/login?return_to=%2Fobsidianmd%2Fobsidian-sample-plugin
