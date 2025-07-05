import { Plugin } from "obsidian";
import { createNewFolderInCurrentDir } from "src/utils/createFolder";
import { createMarkdownWithJson } from "src/utils/createMDFile";
import { getFolderName } from "src/utils/folderName";
import { ModalForm } from "src/modal/form/modal";


export default class DynamicInterfacePlugin extends Plugin {
	// settings: DynamicInterfaceSettings;

	async onload() {
		console.log("Loading Fennec Tales Studio's Plugin");

		this.addRibbonIcon("table", "Create new schema", async () => {
			const folderName = getFolderName(this.app, 'NewFolder');
			await createNewFolderInCurrentDir(this.app, folderName)


			new ModalForm(this.app, async (result) => {
				console.log("Form data:", result);
				await createMarkdownWithJson(this.app, folderName, result)
			}).open();
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
