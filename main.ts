import { Plugin, WorkspaceLeaf } from "obsidian";
import { ModalDataForm } from "src/modal/data/data-modal";
import { ModalDataNotFoundForm } from "src/modal/data/data-not-found";
// import { createNewFolderInCurrentDir } from "src/utils/createFolder";
// import { createMarkdownWithJson } from "src/utils/createMDFile";
// import { getFolderName } from "src/utils/folderName";
import { ModalForm } from "src/modal/form/modal";
import { createNewFolderInCurrentDir } from "src/utils/createFolder";
import { createMarkdownWithJson } from "src/utils/createMDFile";
import { fileExists } from "src/utils/fileExists";
import { getFolderName } from "src/utils/folderName";
import { updateJsonInMarkdownFile } from "src/utils/updateMDFile";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "src/views/card";


export default class DynamicInterfacePlugin extends Plugin {
	// settings: DynamicInterfaceSettings;

	async onload() {
		console.log("Loading Fennec Tales Studio's Plugin");

		this.registerView(
			VIEW_TYPE_EXAMPLE,
			(leaf) => new ExampleView(leaf)
		);

		this.addRibbonIcon('dice', 'Activate view', () => {
			this.activateView();
		});

		this.addRibbonIcon("table", "Create new schema", async () => {
			new ModalForm(this.app, async (isValid, result) => {
				console.log("Form data:", result);
				if (isValid) {

					// Create Folder
					const folderName = getFolderName(this.app, 'NewFolder');
					await createNewFolderInCurrentDir(this.app, folderName)

					// Create Schema File
					const jsonString = JSON.stringify(result, null, 2);
					await createMarkdownWithJson(this.app, folderName, 'entity.md', jsonString)

					// Create Data File
					const jsonStringData = JSON.stringify({
						entity: result.entity,
						label: result.label,
						data: []
					}, null, 2)
					await createMarkdownWithJson(this.app, folderName, 'data.md', jsonStringData)
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
						const jsonString = JSON.stringify(result, null, 2);
						if (currentFolder)
							await updateJsonInMarkdownFile(this.app.vault, `${currentFolder}/data.md`, jsonString)

					}
				}).open();
			} else {
				new ModalDataNotFoundForm(this.app).open()
			}
		})
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			if (leaf)
				await leaf.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf)
			workspace.revealLeaf(leaf);
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
