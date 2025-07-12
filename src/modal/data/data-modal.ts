import { Modal, App, Setting } from "obsidian";
import { TData, TEntity } from "src/types/field";
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
}


