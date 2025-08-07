import { ItemView, Menu, Notice, setIcon, TFile, WorkspaceLeaf } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { ModalForm } from "src/modal/schema/modal";
import { TDataItem } from "src/types/data";
import { TEntity } from "src/types/field";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema, updateEntityFolder, } from "src/utils/entity-util";
import { renderCardView } from "./render/_render";
import { slugify } from "src/utils/slugify";
import DynamicInterfacePlugin from "main";
import { CardInteractionManager } from "./card-interation";

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

		const entitySchema = await getEntitySchema(this.app)
		const btnEditEntitySchema = btnHeaderContainer.createEl("button", { cls: "icon-button" });
		const btnEditEntitySchemaIcon = btnEditEntitySchema.createSpan();
		setIcon(btnEditEntitySchemaIcon, "pencil");
		btnEditEntitySchemaIcon.style.marginRight = "0.5em";
		btnEditEntitySchema.createSpan({ text: "Edit Entity Schema" });
		btnEditEntitySchema.onclick = () => {
			// Editing entity brings a lot of problems, like, what I am gonna do with the camps that are changed? I am gonna delete those?
			new ModalForm(this.app, async (isValid, result) => {
				if (isValid) updateEntityFolder(this.app, result)
			}, entitySchema).open();
		}
	}
}

//https://github.com/login?return_to=%2Fobsidianmd%2Fobsidian-sample-plugin
