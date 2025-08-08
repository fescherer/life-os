import { App, Notice, Setting, TFile } from "obsidian";
import { TDataItem } from "src/types/data";
import { TCommonField } from "src/types/field";
import { getCurrentFolder } from "src/utils/folderName";
import { slugify } from "src/utils/slugify";

export function renderFileData(app: App, dataItem: TDataItem, field: TCommonField, container: HTMLElement) {
	// Image name = field.name + field.id.<extensão original>
	// When user select the image, the image is sent to /files folder
	// If user canceled the creation, just search for image inside the files and delete

	new Setting(container)
		.setName(field.label)
		.addButton(async (btn) => {
			const imagePathContainer = container.createDiv();
			let imageContainer: HTMLImageElement;
			const imagePathText = imagePathContainer.createSpan(dataItem[field.name] ? dataItem[field.name] : '')
			if (dataItem[field.name]) {
				const splitted = dataItem[field.name].split('.')
				if (['jpg', 'jpeg', 'webp', 'png'].contains(splitted[1])) {
					const currentFolder = await getCurrentFolder(app)
					const image = app.vault.getAbstractFileByPath(`${currentFolder}/${dataItem[field.name]}`)
					if (image && image instanceof TFile) {
						const imagePath = app.vault.getResourcePath(image);
						imageContainer = imagePathContainer.createEl('img', { attr: { width: '100px', height: 'auto', src: imagePath } })
					}
				}
			}

			btn.setButtonText("Choose File").onClick(() => {
				const fileInput = document.createElement("input");
				fileInput.type = "file";
				fileInput.accept = "*/*";

				fileInput.onchange = async () => {
					if (!fileInput.files || fileInput.files.length === 0) return;

					const file = fileInput.files[0];

					const arrayBuffer = await file.arrayBuffer();
					const currentFolder = await getCurrentFolder(app)
					const fileExtension = file.type.split('/')[1]
					const fileName = `files/${slugify(dataItem.name)}-${dataItem.id}-${field.id}.${fileExtension}`

					try {
						if (!app.vault.getAbstractFileByPath(`${currentFolder}/files`)) {
							await app.vault.createFolder(`${currentFolder}/files`);
						}
						const fileImage = await app.vault.createBinary(`${currentFolder}/${fileName}`, arrayBuffer);
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
