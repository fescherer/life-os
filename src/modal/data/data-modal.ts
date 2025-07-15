import { Modal, App, Setting, Notice } from "obsidian";
import { TCommonField, TData, TEntity, TOptionItem } from "src/types/field";
import { parseJsonFromMarkdownFile } from "src/utils/readJSONFile";

export class ModalDataForm extends Modal {
	onSubmit: (isValid: boolean, result: Record<string, unknown>) => void;
	result: TData
	isValid: boolean
	data: Array<Record<string, string | boolean | number | Array<string>>> = []

	constructor(app: App, onSubmit: (isValid: boolean, result: Record<string, unknown>) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.result = {
			entity: '',
			label: '',
			data: []
		}
		this.isValid = false
	}


	// {
	// 	"entity": "full",
	// 	"label": "Full",
	// 	"data": [
	// 		{
	// 			"title": "String content",
	// 			"weight": 85.6,
	// 			"show-tutorial": true,
	// 			"birthday": "2025-07-01T19:00:20.511Z",
	// 			"reminder": 3600,
	// 			"favorite-food": "cake",
	// 			"tag": ["one-piece", "kimetsu-non-yaiba", "one-punch-man"],
	// 			"site": "https://google.com",
	// 			"thumbnail": "path/to/file/thumb.png",
	// 			"complex-list": [1,3,4,1,5,12,51,2],
	// 			"food": {
	// 					"name": "Red Velvet",
	// 					"quantity": 3
	// 			}
	// 		}
	// 	]
	// }


	async onOpen() {
		const { contentEl } = this;

		const activeFile = this.app.workspace.getActiveFile();
		const currentFolder = activeFile?.parent?.path;

		const entitySchema = await parseJsonFromMarkdownFile(this.app.vault, `${currentFolder}/entity.md`) as TEntity

		this.result.entity = entitySchema.entity
		this.result.label = entitySchema.label

		contentEl.createEl("h2", { text: `Create new data for ${entitySchema.label}` });

		const dataField: Record<string, string | boolean | number | Array<string>> = {}
		this.result.data.push(dataField)
		entitySchema.fields.map(field => {
			switch (field.type) {
				case 'string':
					new Setting(contentEl).setName(field.label)
						.addText(text => text.onChange(val => (dataField[field.name] = val)));
					break;
				case 'number':
					new Setting(contentEl).setName(field.label)
						.addText(text => {
							text.inputEl.type = "number";
							text.onChange(val => (dataField[field.name] = val))
						});
					break;
				case 'boolean':
					new Setting(contentEl).addToggle(c => c.onChange(val => (dataField[field.name] = val)))
					break;
				case 'date':
					break;
				case 'select':
					new Setting(contentEl).addDropdown(dropdown => {
						const options = this.getOptionsFormat(field.options)

						dropdown
							.addOptions((options))
							.onChange(val => (dataField[field.name] = val))
					})
					break;
				case 'multiselect':
					new Setting(contentEl).addDropdown(dropdown => {
						const optionsContainer = contentEl.createEl("div");

						let options = this.getOptionsFormat(field.options)
						dropdown
							.addOptions(options)
							.onChange(val => {
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
								const { [val]: _, ...newOptions } = options
								options = newOptions
								optionsContainer
								// dataField[field.name] = val
							})
					})
					break;
				case 'url':
					this.getURL(dataField, contentEl, field)
					break;
				case 'file':

					new Setting(contentEl)
						.setName(field.label)
						.addButton((btn) => {
							const imagePathText = contentEl.createDiv();
							btn.setButtonText("Choose File").onClick(() => {
								const fileInput = document.createElement("input");
								fileInput.type = "file";
								fileInput.accept = "*/*"; // You can limit to specific types, e.g., ".pdf" or "image/*"

								fileInput.onchange = async () => {
									if (!fileInput.files || fileInput.files.length === 0) return;

									const file = fileInput.files[0];

									const arrayBuffer = await file.arrayBuffer();
									const fileName = file.name;
									const targetPath = `${currentFolder}/files/${fileName}`;

									try {
										const folderPath = targetPath.split("/").slice(0, -1).join("/");
										if (!this.app.vault.getAbstractFileByPath(folderPath)) {
											await this.app.vault.createFolder(folderPath);
										}

										await this.app.vault.createBinary(targetPath, arrayBuffer);

										new Notice(`Imported file: ${fileName}`);
										imagePathText.setText(fileName)
										dataField[field.name] = fileName
									} catch (err) {
										console.error("Error importing file:", err);
										new Notice("Failed to import file.");
									}
								};
								fileInput.click();
							});
						})
					break;
				case 'array':
					new Setting(contentEl).setName(field.label)
						.addText(text => text.onChange(val => (dataField[field.name] = val)));
					break;
				case 'conditional':
					break;
			}
		})

		new Setting(contentEl).addButton(btn => {
			btn.setButtonText('verify').onClick(() => {
				// if (true) {

				this.onSubmit(true, this.result);
				// this.close();
				return true
				// } else {
				// 	new Notice("Fill all the fields");
				// }
			})
		})
	}

	onClose() {
		// new Notice("You close before saving. Creating with default values! ");
		// const { contentEl } = this;
		// this.onSubmit(false, {
		// 	name: "Default Name",
		// 	type: "string",
		// });
		// contentEl.empty();
	}

	getOptionsFormat(options: TOptionItem[]) {
		return options.reduce<Record<string, string>>((acc, item) => {
			acc[item.title] = item.title
			return acc
		}, {})
	}

	getURL(dataField: Record<string, string | number | boolean | string[]>, contentEl: HTMLElement, field: TCommonField) {
		let urlPrefix = 'https://'
		let url = ''

		const updateCombined = async () => {
			const part1 = urlPrefix || "";
			const part2 = url || "";
			dataField[field.name] = `${part1}${part2}`;
		};

		new Setting(contentEl)
			.setName(field.label)
			.addText(text1 => {
				text1
					.setPlaceholder("Prefix")
					.setValue(urlPrefix || "")
					.onChange(value => {
						urlPrefix = value;
						updateCombined();
					});
			})
			.addText(text2 => {
				text2
					.setPlaceholder("URL")
					.setValue(url || "")
					.onChange(value => {
						url = value;
						updateCombined();
					});
			});
	}
}


