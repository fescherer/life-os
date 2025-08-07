import { App, Modal } from "obsidian";
import { TDataItem } from "src/types/data";
import { getEntitySchema } from "src/utils/entity-util";

export class DetailsModal extends Modal {
    private data: TDataItem

    constructor(app: App, data: TDataItem) {
        super(app);
        this.data = data
    }

    async onOpen() {
        const { contentEl } = this;

        contentEl.addClass("data-modal");

        // === Header with buttons ===
        // const header = contentEl.createEl("div", { cls: "data-modal-header" });
        // const editBtn = header.createEl("button", { text: "Edit" });
        // const closeBtn = header.createEl("button", { text: "Close" });
        // editBtn.onclick = () => {
        //     // this.props.onEdit();
        //     console.log('Edit modal')
        // };
        // closeBtn.onclick = () => this.close();


        const container = contentEl.createEl("div", { cls: "data-modal-body" });

        // === Left (Image) ===
        const entitySchema = await getEntitySchema(this.app)
        const imageField = entitySchema.fields.find(item => item.type == 'file')
        const left = container.createEl("div", { cls: "data-modal-left" });
        if (imageField) {
            const splitted = this.data[imageField.name].split('.')
            if (['jpg', 'jpeg', 'webp', 'png'].contains(splitted[1]))
                left.createEl("img", { attr: { src: this.data.imageUrl }, cls: "data-modal-image" });
        }

        // === Right (Data List) ===
        const right = container.createEl("div", { cls: "data-modal-right" });


        entitySchema.fields.forEach((field) => {
            const row = right.createEl("div", { cls: "data-row" });
            row.createEl("div", { text: field.label, cls: "data-label" });

            const valueEl = row.createEl("div", { cls: "data-value" });

            switch (field.type) {
                case "boolean":
                    valueEl.textContent = this.data[field.name] ? "✅ Yes" : "❌ No";
                    break;
                case "url":
                    valueEl.createEl("a", { text: this.data[field.name], href: this.data[field.name], attr: { target: "_blank" } });
                    break;
                case "markdown":
                    valueEl.createEl("pre", { text: this.data[field.name] });
                    break;
                case "array":
                    valueEl.textContent = this.data[field.name]
                    break;
                case "file":
                    valueEl.textContent = this.data[field.name] ?? "No file";
                    break;
                default:
                    valueEl.textContent = String(this.data[field.name]);
                    break;
            }
        })
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}