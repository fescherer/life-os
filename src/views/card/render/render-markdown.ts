import { Notice, setIcon, TFile } from "obsidian";
import { TDataItem } from "src/types/data";
import { TEntity } from "src/types/field";
import { slugify } from "src/utils/slugify";

//TODO Problema, e se tiver dois fields markdown e files? O id sera o mesmo e vai dar pau
export async function renderMarkdownCardView(contentEl: HTMLElement, dataItem: TDataItem, fieldName: string, entitySchema: TEntity) {
    const mdContainer = contentEl.createDiv({ cls: 'flex-container' })
    mdContainer.createDiv({ text: `${fieldName}: ` })

    const link = mdContainer.createEl("button", { cls: "icon-button" });
    const linkIcon = link.createSpan();
    setIcon(linkIcon, "external-link");
    linkIcon.style.marginRight = "0.5em";
    link.createSpan({ text: ".md" });

    link.onClickEvent(async () => {
        const field = entitySchema.fields.find(item => item.name === fieldName && item.type === 'markdown')
        if (!field) return
        const filePath = `md/${slugify(dataItem.name)}-${dataItem.id}-${field.id}.md`

        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof TFile) {
            const leaf = this.app.workspace.getLeaf(true);
            await leaf.openFile(file);
        } else {
            new Notice(`File not found: ${filePath}`);
        }
    })

}