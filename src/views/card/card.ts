import { App, Notice, setIcon, TFile } from "obsidian";
import { TDataItem } from "src/types/data";
import { TEntity } from "src/types/field";
import { getCurrentFolder } from "src/utils/folderName";

export class Card {
    private app: App
    private data: TDataItem
    private wrapperContainer: HTMLElement
    private entitySchema: TEntity

    constructor(app: App, data: TDataItem, wrapperContainer: HTMLElement, entitySchema: TEntity) {
        if (!data) new Notice('Data not found for this card')
        this.app = app
        this.data = data
        this.wrapperContainer = wrapperContainer
        this.entitySchema = entitySchema
    }

    public getCardData() {
        return this.data
    }

    public async render() {
        const cardContainer = this.wrapperContainer.createDiv({ cls: "card" });
        cardContainer.dataset.cardId = `card-${this.data.id}`;

        const headerContainer = cardContainer.createDiv({ cls: 'flex-container' })
        headerContainer.createEl("span", { text: this.data.name });
        const optButtons = headerContainer.createEl("button", {})
        setIcon(optButtons, 'ellipsis-vertical')
        optButtons.onclick = (e) => {
            console.log('Left CLick', e)
            const event = new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: e.clientX,
                clientY: e.clientY,
            });

            optButtons.dispatchEvent(event);
        }

        const imageField = this.entitySchema.fields.find((field) => field.type == 'file')
        const imageContainer = cardContainer.createDiv({ cls: 'image-card-container' })
        if (imageField) {
            // TODO Make img-cover style
            const currentFolder = await getCurrentFolder(this.app)
            const image = this.app.vault.getAbstractFileByPath(`${currentFolder}/${this.data[imageField.name]}`)
            if (image && image instanceof TFile) {
                const imagePath = this.app.vault.getResourcePath(image);
                imageContainer.createEl('img', {
                    cls: 'card-image',
                    attr: {
                        src: imagePath,
                        width: "200",
                        loading: 'lazy'
                    }
                })
            } else {
                new Notice('An error has occured')
            }
        }
    }

    public delete() {

    }
}






// async function renderCardHeader(app: App, card: HTMLElement, data: TDataItem, entitySchema: TEntity) {
//     // const btnContainer = card.createDiv({ cls: "btn-container" })
//     // btnContainer.createEl("span", { text: `Field Index: ${index.toString()}` });

//     // const btnEdit = btnContainer.createEl("button", { cls: "icon-button" });
//     // setIcon(btnEdit, "pencil");
//     // btnEdit.onclick = () => {
//     // 	new ModalDataForm(this.app, data).open();
//     // }

//     // const btnRemove = btnContainer.createEl("button", { cls: "icon-button" });
//     // setIcon(btnRemove, "trash");
//     // btnRemove.onclick = () => {
//     // 	new ConfirmDialog(this.app,
//     // 		'Do you want to remove this item?',
//     // 		async () => {
//     // 			const currentFolder = await getCurrentFolder(this.app)
//     // 			const entityData = await getEntityData(this.app)

//     // 			const newData = entityData.data.filter((item) => item.id !== data.id)
//     // 			const jsonString = JSON.stringify({ ...entityData, data: newData }, null, 2);

//     // 			if (currentFolder)
//     // 				await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
//     // 			new Notice(`You hve deleted an item from ${entityData.label}`)
//     // 		}, () => {

//     // 		}).open()
//     // 	this.onOpen()
//     // }

//     // const fileImage = this.app.vault.getAbstractFileByPath(`${targetPath}/${fileName}`)
//     // if (fileImage && fileImage instanceof TFile) {
//     // 	const img = document.createElement("img");
//     // 	img.src = path;
//     // 	imageContainer.appendChild(img);
//     // }


// }