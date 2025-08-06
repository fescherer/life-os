import { App, Menu, Notice, TFile } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { TDataItem } from "src/types/data";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { getCurrentFolder } from "src/utils/folderName";
import { updateMDFile } from "src/utils/markdown-manager";

export async function addContextMenu(app: App, card: HTMLElement, data: TDataItem, render: () => Promise<void>) {
    card.addEventListener("contextmenu", (event) => {
        card.classList.add('card-selected')

        event.preventDefault();
        const menu = new Menu();
        menu.addItem((item) =>
            item.setTitle("Edit").setIcon("pencil").onClick(() => {
                new ModalDataForm(app, data).open();
                render()
            })
        );
        menu.addItem((item) =>
            item.setTitle("Delete").setIcon("trash").onClick(() => {
                new ConfirmDialog(app,
                    'Do you want to remove this item?',
                    async () => {
                        const currentFolder = await getCurrentFolder(app)
                        const entityData = await getEntityData(app)
                        const entitySchema = await getEntitySchema(app)

                        entitySchema.fields.map(async (field) => {
                            if (field.type === 'file') {
                                const foundFile = app.vault.getAbstractFileByPath(`${currentFolder}/files/${data[field.name]}`);

                                if (foundFile instanceof TFile) {
                                    await app.vault.delete(foundFile);
                                }
                            }
                            if (field.type === 'markdown') {
                                const foundFileMD = app.vault.getAbstractFileByPath(`${currentFolder}/${data[field.name]}`);

                                if (foundFileMD instanceof TFile) {
                                    await app.vault.delete(foundFileMD);
                                }
                            }
                        })

                        const newData = entityData.data.filter((item) => item.id !== data.id)
                        const jsonString = JSON.stringify({ ...entityData, data: newData }, null, 2);

                        if (currentFolder)
                            await updateMDFile(app.vault, `${currentFolder}/data.md`, jsonString)
                        new Notice(`You have deleted an item from ${entityData.label}`)
                        render()
                    }, () => {

                    }).open()
            })
        );

        menu.showAtPosition({ x: event.pageX, y: event.pageY });

        // Add temporary listener to remove the class
        const removeClass = () => {
            card.classList.remove("card-selected");
            window.removeEventListener("pointerdown", removeClass, true);
        };
        window.addEventListener("pointerdown", removeClass, true);
    });
}