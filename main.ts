import { Plugin } from "obsidian";
import { ModalDataForm } from "src/modal/data/data-modal";
import { ModalDataNotFoundForm } from "src/modal/data/data-not-found";
// import { createNewFolderInCurrentDir } from "src/utils/createFolder";
// import { createMarkdownWithJson } from "src/utils/createMDFile";
// import { getFolderName } from "src/utils/folderName";
import { ModalForm } from "src/modal/form/modal";
import { TEntity } from "src/types/field";
import { createEntityFolder, getEntityData } from "src/utils/entity-util";
import { fileExists, updateMDFile } from "src/utils/markdown-manager";
import { CARD_VIEW_TYPE, CardView } from "src/views/card-view";


export default class DynamicInterfacePlugin extends Plugin {
	// settings: DynamicInterfaceSettings;

	async onload() {
		console.log("Loading Fennec Tales Studio's Plugin");

		this.registerView(
			CARD_VIEW_TYPE,
			(leaf) => new CardView(leaf)
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
				console.log("Form data:", result);
				if (isValid) {
					createEntityFolder(result as TEntity)
				}
			}).open();
		})

		this.addRibbonIcon("newspaper", "Create new data block", async () => {
			const activeFile = this.app.workspace.getActiveFile();
			const currentFolder = activeFile?.parent?.path;
			const file = fileExists(this.app, `${currentFolder}/entity.md`)
			if (file) {
				new ModalDataForm(this.app, async (isValid, result) => {
					console.log("Form data:", result);
					if (isValid) {
						console.log('Data sent: ', result)

						// Create string data
						const entityData = await getEntityData(this.app)
						const jsonString = JSON.stringify({ ...entityData, data: [...entityData.data, result] }, null, 2);
						if (currentFolder)
							await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
					}
				}).open();
			} else {
				new ModalDataNotFoundForm(this.app).open()
			}
		})
	}

	// 	const viewType = this.settings.viewType;
	// 	if (!folder) {
	// 		new Notice("Please configure a folder in plugin settings.");
	// 		return;
	// 	}

	// 	const schema = await loadSchema(folder, this.app.vault);
	// 	const dataItems = await loadData(folder, this.app.vault);
	// 	const form = createForm(schema, {});
	// 	const modal = new DynamicFormModal(this.app, form, async () => {
	// 		const data = collectFormData(form, schema);
	// 		const items = await loadData(folder, this.app.vault);
	// 		items.push(data);
	// 		await saveData(folder, this.app.vault, items);
	// 		new Notice("Item saved");
	// 	});
	// 	modal.open();
	// 	dataItems.forEach((data) => {
	// 		let el: HTMLElement;
	// 		switch (viewType) {
	// 			case "card":
	// 				el = renderCard(schema, data);
	// 				break;
	// 			case "list":
	// 				el = renderList(schema, data);
	// 				break;
	// 			case "table":
	// 				el = renderTable(schema, [data]);
	// 				break;
	// 			default:
	// 				el = renderCard(schema, data);
	// 		}
	// 		modal.contentEl.appendChild(el);
	// 	});
	// 	modal.open();
	// });


	// async onload() {
	// 	console.log("Loading Fennec Tales Studio's Plugin");
	// 	this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

	// 	this.addSettingTab(new DynamicInterfaceSettingTab(this.app, this));

	// 	function collectFormData(form: HTMLElement, schema: EntitySchema): any {
	// 		const data: any = {};
	// 		schema.fields.forEach((field) => {
	// 			const input = form.querySelector(
	// 				`[name="${field.name}"]`
	// 			) as HTMLInputElement;
	// 			if (!input) return;
	// 			switch (field.type) {
	// 				case "string":
	// 				case "url":
	// 				case "date":
	// 					data[field.name] = input.value;
	// 					break;
	// 				case "number":
	// 					data[field.name] = parseFloat(input.value);
	// 					break;
	// 				case "boolean":
	// 					data[field.name] = input.checked;
	// 					break;
	// 				case "select":
	// 					data[field.name] = input.value;
	// 					break;
	// 				case "multiselect":
	// 					if (input instanceof HTMLSelectElement) {
	// 						const options = Array.from(input.selectedOptions);
	// 						data[field.name] = options.map(o => o.value);
	// 					} else {
	// 						console.warn(`Expected select element for field ${field.name}, but got`, input);
	// 					}
	// 					break;
	// 				case "array":
	// 				case "list":
	// 					data[field.name] = input.value.split(",").map((s) => s.trim());
	// 					break;
	// 			}
	// 		});
	// 		return data;
	// 	}

	// 	this.addCommand({
	// 		id: "add-new-item",
	// 		name: "Add new item",
	// 		callback: async () => {
	// 			const folder = this.settings.folder;
	// 			if (!folder) {
	// 				new Notice("Please set a folder in plugin settings.");
	// 				return;
	// 			}

	// 			const schema = await loadSchema(folder, this.app.vault);

	// 			const form = createForm(schema, {});
	// 			const modal = new DynamicFormModal(this.app, form, async () => {
	// 				const data = collectFormData(form, schema);
	// 				const items = await loadData(folder, this.app.vault);
	// 				items.push(data);
	// 				await saveData(folder, this.app.vault, items);
	// 				new Notice("Item saved");
	// 			});
	// 			modal.open();
	// 			modal.titleEl.setText(`Add New ${schema.label}`);
	// 			modal.contentEl.appendChild(form);

	// 			const saveButton = document.createElement("button");
	// 			saveButton.innerText = "Save";
	// 			saveButton.addEventListener("click", async () => {
	// 				// Collect form data
	// 				const data = collectFormData(form, schema);
	// 				const items = await loadData(folder, this.app.vault);
	// 				items.push(data);
	// 				await saveData(folder, this.app.vault, items);
	// 				new Notice("Item saved");
	// 				modal.close();
	// 			});

	// 			modal.contentEl.appendChild(saveButton);
	// 			modal.open();
	// 		},
	// 	});

	// 	this.addRibbonIcon("table", "Open Dynamic Interface", async () => {
	// 		const folder = this.settings.folder;
	// 		const viewType = this.settings.viewType;
	// 		if (!folder) {
	// 			new Notice("Please configure a folder in plugin settings.");
	// 			return;
	// 		}

	// 		const schema = await loadSchema(folder, this.app.vault);
	// 		const dataItems = await loadData(folder, this.app.vault);
	// 		const form = createForm(schema, {});
	// 		const modal = new DynamicFormModal(this.app, form, async () => {
	// 			const data = collectFormData(form, schema);
	// 			const items = await loadData(folder, this.app.vault);
	// 			items.push(data);
	// 			await saveData(folder, this.app.vault, items);
	// 			new Notice("Item saved");
	// 		});
	// 		modal.open();
	// 		dataItems.forEach((data) => {
	// 			let el: HTMLElement;
	// 			switch (viewType) {
	// 				case "card":
	// 					el = renderCard(schema, data);
	// 					break;
	// 				case "list":
	// 					el = renderList(schema, data);
	// 					break;
	// 				case "table":
	// 					el = renderTable(schema, [data]);
	// 					break;
	// 				default:
	// 					el = renderCard(schema, data);
	// 			}
	// 			modal.contentEl.appendChild(el);
	// 		});
	// 		modal.open();
	// 	});
	// }

	// async saveSettings() {
	// 	await this.saveData(this.settings);
	// }
}
