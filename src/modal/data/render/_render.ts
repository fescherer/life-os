import { App, Notice, Setting } from "obsidian";
import { getEntitySchema } from "src/utils/entity-util";
import { TDataItem } from "src/types/data";
import { createData } from "../create-data";
import { TFileField } from "src/types/field";
import { getMarkdownFilePath } from "../create-file";
import { getCurrentFolder } from "src/utils/folderName";

export async function RenderData(app: App, contentEl: HTMLElement, dataItem: TDataItem, entityCountId: number, isSubmited: boolean, defaultData?: TDataItem) {
	const entitySchema = await getEntitySchema(app)

	const dialogTitle = defaultData ? '' : 'Create'
	contentEl.createEl("h2", { text: `${dialogTitle} data for ${entitySchema.label}` });

	new Setting(contentEl)
		.setName("Data Name")
		.addText(text => {
			text.setValue(dataItem.name)
			text.onChange(val => {
				dataItem.name = val
				// renderFields(app, dataItem, entitySchema, fieldContainer)
			})
		});

	const fieldContainer = contentEl.createDiv()
	entitySchema.fields.map(async (field) => {
		switch (field.type) {
			case 'string':
				// 	renderString(field, fieldContainer)
				break;
			// case 'number':
			// 	RenderNumberData(field, fieldContainer)
			// 	break;
			// case 'boolean':
			// 	renderBoolean(field, fieldContainer)
			// 	break;
			// case 'date':
			// 	renderDate(field, fieldContainer)
			// 	break;
			// case 'select':
			// 	renderSelect(field, fieldContainer)
			// 	break;
			// case 'url':
			// 	renderURL(field, fieldContainer)
			// 	break;
			case 'file':
				renderFile(app, dataItem, field, fieldContainer)
				break;
			// case 'array':
			// 	renderArray(field, fieldContainer)
			// 	break;
			case 'markdown':
				await renderMarkdown(app, dataItem, field, fieldContainer)
				break;
		}
	})

	new Setting(contentEl).addButton(btn => {
		btn.setButtonText('verify').onClick(async () => {
			await createData(app, dataItem, entityCountId, isSubmited, defaultData)
		})
	})
}

async function renderMarkdown(app: App, dataItem: TDataItem, field: TFileField, container: HTMLElement) {
	const entitySchema = await getEntitySchema(app)
	const file = getMarkdownFilePath(field, entitySchema, dataItem)
	dataItem[field.name] = file
	const splitted = file.split('/')
	new Setting(container).setName(field.label).then(setting => {
		setting.controlEl.createEl("span", {
			text: `${splitted[0]}/<data-name>${splitted[1]}`,
			cls: "setting-item-description"
		});
	})
}

function renderFile(app: App, dataItem: TDataItem, field: TFileField, container: HTMLElement) {
	// Image name = field.name + field.id.<extensão original>
	// When user select the image, the image is sent to /files folder
	// If user canceled the creation, just search for image inside the files and delete

	new Setting(container)
		.setName(field.label)
		.addButton((btn) => {
			const imagePathContainer = container.createDiv();
			let imageContainer: HTMLImageElement;
			const imagePathText = imagePathContainer.createSpan(dataItem[field.name] ? dataItem[field.name] : '')
			if (dataItem[field.name])
				imageContainer = imagePathContainer.createEl('img', { attr: { width: '100px', height: '100px', src: `files/${dataItem[field.name]}` } })

			btn.setButtonText("Choose File").onClick(() => {
				const fileInput = document.createElement("input");
				fileInput.type = "file";
				fileInput.accept = "*/*";

				fileInput.onchange = async () => {
					if (!fileInput.files || fileInput.files.length === 0) return;

					const file = fileInput.files[0];

					const arrayBuffer = await file.arrayBuffer();
					const currentFolder = await getCurrentFolder(app)
					const targetPath = `${currentFolder}/files`;
					const fileExtension = file.type.split('/')[1]
					const fileName = `${field.name}_${field.id}.${fileExtension}`

					try {
						if (!app.vault.getAbstractFileByPath(targetPath)) {
							await app.vault.createFolder(targetPath);
						}
						const fileImage = await app.vault.createBinary(`${targetPath}/${fileName}`, arrayBuffer);
						const path = app.vault.getResourcePath(fileImage);


						imagePathText.setText(fileName)
						if (imageContainer)
							imagePathContainer.setAttr('src', path)
						else
							imagePathContainer.createEl('img', { attr: { width: '100px', height: '100px', src: path } })
						dataItem[field.name] = fileName
					} catch (err) {
						new Notice("Failed to import file.");
					}
				};
				fileInput.click();
			});
		})
}
