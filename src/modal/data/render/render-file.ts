import { App, setIcon, Setting, TFile } from "obsidian";
import { TDataItem } from "src/types/data";
import { TCommonField } from "src/types/field";
import { getCurrentFolder } from "src/utils/folderName";

export function renderFileData(app: App, dataItem: TDataItem, field: TCommonField, container: HTMLElement, aux: Record<string, { file: File, id: string }[]>) {

	new Setting(container)
		.setName(field.label)
		.addButton(async (btn) => {
			const imagesContainer = container.createDiv({ cls: 'flex-container' });
			if (dataItem[field.name]) {
				const splited = dataItem[field.name].split('||')

				for (const item of splited) {
					const currentFolder = await getCurrentFolder(app)
					const tfile = this.app.vault.getAbstractFileByPath(`${currentFolder}/${item}`);
					if (!(tfile instanceof TFile)) return null;

					const data = await app.vault.readBinary(tfile);
					aux[field.name].push({ id: crypto.randomUUID(), file: new File([data], tfile.name, { type: "application/octet-stream" }) })
				}
				renderFilesPreview(imagesContainer, aux, field.name)
			}


			btn.setButtonText("Choose File").onClick(() => {

				const fileInput = document.createElement("input");
				fileInput.type = "file";
				fileInput.accept = "*/*";
				fileInput.multiple = true;

				fileInput.onchange = async () => {
					if (!fileInput.files || fileInput.files.length === 0) return;

					for (const file of Array.from(fileInput.files)) {
						aux[field.name].push({
							id: crypto.randomUUID(),
							file: file
						})
					}

					renderFilesPreview(imagesContainer, aux, field.name)
				}
				fileInput.click();
			})
		})
}


async function renderFilesPreview(wrapper: HTMLElement, aux: Record<string, { file: File, id: string }[]>, fieldName: string) {
	wrapper.empty()

	for (const file of aux[fieldName]) {
		const imageContainer = wrapper.createDiv({ cls: 'file-preview' })

		// Remove Btn
		const removeBtn = imageContainer.createEl('button')
		setIcon(removeBtn, 'x')
		removeBtn.onclick = async () => {
			const filtered = aux[fieldName].filter(curFile => curFile.id != file.id)
			aux[fieldName] = filtered

			renderFilesPreview(wrapper, aux, fieldName)
		}

		const fileExtension = file.file.name.substring(file.file.name.lastIndexOf('.') + 1).toLowerCase()

		if (['jpg', 'jpeg', 'webp', 'png'].contains(fileExtension)) {
			imageContainer.createEl('img', { attr: { width: "100%", height: 'auto', src: URL.createObjectURL(file.file) } })
		} else {
			const defaultImage = imageContainer.createDiv()
			setIcon(defaultImage, 'file')
		}
	}
}
