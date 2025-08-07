import { App, Menu, Notice, TFile } from "obsidian";
import { ModalDataForm } from "src/modal/data/modal";
import { DetailsModal } from "src/modal/details/modal";
import { TDataItem } from "src/types/data";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { getCurrentFolder } from "src/utils/folderName";
import { updateMDFile } from "src/utils/markdown-manager";
import { deleteCard } from "./delete-card";

export async function addContextMenu(app: App, card: HTMLElement, data: TDataItem, render: () => Promise<void>) {

    card.addEventListener('click', () => {
        card.classList.add('card-selected')
    })

    card.addEventListener('dblclick', () => {
        console.log('double')
        new DetailsModal(this.app, data).open()
    })

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
                deleteCard(app, data)
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