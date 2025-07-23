import { ItemView, WorkspaceLeaf } from 'obsidian';
import { TData, TEntity } from 'src/types/field';
import { parseJsonFromMarkdownFile } from 'src/utils/readJSONFile';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class ExampleView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return 'Example view';
	}

	async onOpen() {
		const { contentEl } = this;
		console.log('thaaaaaaaaau')
		const activeFile = this.app.workspace.getActiveFile();
		const currentFolder = activeFile?.parent?.path;

		const entitySchema = await parseJsonFromMarkdownFile(this.app.vault, `${currentFolder}/entity.md`) as TEntity
		const entityData = await parseJsonFromMarkdownFile(this.app.vault, `${currentFolder}/data.md`) as TData

		contentEl.empty();
		contentEl.createEl("h2", { text: `Hello! You are seeing schema of ${entitySchema.label}` });
		// const cardContainer = contentEl.createEl("div")

		entityData.data.map((field, a, b) => {
			console.log(field, a, b)
			// switch (field) {
			//     case 'string':
			//         // new Setting(contentEl).setName(field.label)
			//         //     .addText(text => text.onChange(val => (dataField[field.name] = val)));
			//         break;
			//     case 'number':
			//         // new Setting(contentEl).setName(field.label)
			//         //     .addText(text => {
			//         //         text.inputEl.type = "number";
			//         //         text.onChange(val => (dataField[field.name] = val))
			//         //     });
			//         break;
			//     case 'boolean':
			//         // new Setting(contentEl).addToggle(c => c.onChange(val => (dataField[field.name] = val)))
			//         break;
			//     case 'date':
			//         break;
			//     case 'select':
			//         // new Setting(contentEl).addDropdown(dropdown => {
			//         //     const options = this.getOptionsFormat(field.options)

			//         //     dropdown
			//         //         .addOptions((options))
			//         //         .onChange(val => (dataField[field.name] = val))
			//         // })
			//         break;
			//     case 'multiselect':
			//         // new Setting(contentEl).addDropdown(dropdown => {
			//         //     const optionsContainer = contentEl.createEl("div");

			//         //     let options = this.getOptionsFormat(field.options)
			//         //     dropdown
			//         //         .addOptions(options)
			//         //         .onChange(val => {
			//         //             // eslint-disable-next-line @typescript-eslint/no-unused-vars
			//         //             const { [val]: _, ...newOptions } = options
			//         //             options = newOptions
			//         //             optionsContainer
			//         //             // dataField[field.name] = val
			//         //         })
			//         // })
			//         break;
			//     case 'url':
			//         // this.getURL(dataField, contentEl, field)
			//         break;
			//     case 'file':

			//         // new Setting(contentEl)
			//         //     .setName(field.label)
			//         //     .addButton((btn) => {
			//         //         const imagePathText = contentEl.createDiv();
			//         //         btn.setButtonText("Choose File").onClick(() => {
			//         //             const fileInput = document.createElement("input");
			//         //             fileInput.type = "file";
			//         //             fileInput.accept = "*/*"; // You can limit to specific types, e.g., ".pdf" or "image/*"

			//         //             fileInput.onchange = async () => {
			//         //                 if (!fileInput.files || fileInput.files.length === 0) return;

			//         //                 const file = fileInput.files[0];

			//         //                 const arrayBuffer = await file.arrayBuffer();
			//         //                 const fileName = file.name;
			//         //                 const targetPath = `${currentFolder}/files/${fileName}`;

			//         //                 try {
			//         //                     const folderPath = targetPath.split("/").slice(0, -1).join("/");
			//         //                     if (!this.app.vault.getAbstractFileByPath(folderPath)) {
			//         //                         await this.app.vault.createFolder(folderPath);
			//         //                     }

			//         //                     await this.app.vault.createBinary(targetPath, arrayBuffer);

			//         //                     new Notice(`Imported file: ${fileName}`);
			//         //                     imagePathText.setText(fileName)
			//         //                     dataField[field.name] = fileName
			//         //                 } catch (err) {
			//         //                     console.error("Error importing file:", err);
			//         //                     new Notice("Failed to import file.");
			//         //                 }
			//         //             };
			//         //             fileInput.click();
			//         //         });
			//         //     })
			//         break;
			//     case 'array':
			//         // new Setting(contentEl).setName(field.label)
			//         //     .addText(text => text.onChange(val => (dataField[field.name] = val)));
			//         break;
			//     case 'conditional':
			//         break;
			// }
		})


	}

	async onClose() {
		// Nothing to clean up.
	}
}
