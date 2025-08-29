import { ItemView, setIcon, TFile, ViewStateResult, WorkspaceLeaf } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { ModalSchemaForm } from "src/modal/schema/modal";
import { getEntitySchema } from "src/utils/entity-schema-manager";
import { renderCardView } from "./render/_render";
import DynamicInterfacePlugin from "main";

export const CARD_VIEW_TYPE = "card-view";

export class CardView extends ItemView {
	plugin: DynamicInterfacePlugin;
	currentFolder: string;

	constructor(leaf: WorkspaceLeaf, plugin: DynamicInterfacePlugin) {
		super(leaf);
		this.plugin = plugin;
		this.currentFolder = "";
	}

	getViewType() {
		return CARD_VIEW_TYPE;
	}

	getDisplayText() {
		return this.currentFolder
			? `Card View (${this.currentFolder})`
			: "Card View";
	}

	// 👉 save folder in view state
	getState(): any {
		return {
			...super.getState(),
			currentFolder: this.currentFolder,
		};
	}

	// 👉 restore folder when reopening
	async setState(state: any, result: ViewStateResult): Promise<void> {
		this.currentFolder = state.currentFolder ?? "";
		await super.setState(state, result);
		await this.render();
	}

	setFolder(folder: string) {
		this.currentFolder = folder;
		this.render();
	}

	async onOpen() {
		this.registerEvent(
			this.app.workspace.on("fennec:data-updated", () => {
				this.render();
			})
		);

		if (!this.currentFolder) {
			const { contentEl } = this;
			contentEl.empty();
			const wrapper = contentEl.createDiv({ cls: "no-view" });
			wrapper.createEl("h2", { text: "🦒There is no entity schema saved!" });
			const btn = wrapper.createEl("button", { text: "Create Entity Schema" });
			btn.onclick = () => new ModalSchemaForm(this.app).open();
		} else {
			await this.render();
		}
	}

	async render() {
		const { contentEl } = this;
		contentEl.empty();

		if (!this.currentFolder) return;

		console.log("Rendering folder", this.currentFolder);
		const entityData = await getEntitySchema(this.app, this.currentFolder);
		if (!entityData) return;

		contentEl.createEl("h2", { text: `Hello! You are seeing data of ${entityData?.entity}` });

		const btnHeaderContainer = contentEl.createDiv({ cls: "btn-container" });
		[
			{ icon: "update", text: "Update View", fn: () => this.app.workspace.trigger("fennec:data-updated") },
			{ icon: "plus", text: "Add data", fn: () => new ModalDataForm(this.app).open() },
			{ icon: "pencil", text: "Edit Entity Schema", fn: () => new ModalSchemaForm(this.app, entityData).open() },
		].forEach((item) => {
			const btn = btnHeaderContainer.createEl("button", { cls: "icon-button" });
			const btnIconContainer = btn.createSpan();
			setIcon(btnIconContainer, item.icon);
			btnIconContainer.style.marginRight = "0.5em";
			btn.createSpan({ text: item.text });
			btn.onclick = () => item.fn();
		});

		renderCardView(this.app, contentEl, this.plugin);
	}
}