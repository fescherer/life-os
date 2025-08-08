import { Modal, App, Setting, Notice, setIcon } from "obsidian";
import { slugify } from "../../utils/slugify";
import { TEntity, TField, TNumberField, TSelectField, TTypeField } from "src/types/field";
import { createEntitySchema } from "src/utils/entity-schema-manager";
import { renderField } from "./render/_render";

export class ModalSchemaForm extends Modal {
	entity: TEntity
	isSubmited: boolean
	title: string
	buttonText: string

	constructor(app: App, defaultData?: TEntity) {
		super(app);
		this.isSubmited = false;
		this.entity = defaultData ? defaultData : {
			entity: '',
			label: '',
			fields: []
		}
		this.title = defaultData ? `Edit ${this.entity.label}` : 'Create new Entity'
		this.buttonText = defaultData ? `Edit ${this.entity.label}` : "Create"
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: this.title });

		new Setting(contentEl)
			.setName("Name")
			.addText(text => {
				text.setValue(this.entity.label)
				text.onChange(val => (this.entity.label = val))
			});


		new Setting(contentEl)
			.addButton(btn =>
				btn.setButtonText("Add Field").setCta().onClick(() => {
					const newField = {
						id: this.entity.fields.length,
						name: '',
						label: '',
						type: 'string',
					} as Extract<TField, { type: TTypeField }>

					this.entity.fields.push(newField)

					renderField(this.entity, wrapper, newField)
				})
			);

		const wrapper = contentEl.createDiv();

		this.entity.fields.map(field => renderField(this.entity, wrapper, field))

		new Setting(contentEl)
			.addButton(btn =>
				btn.setButtonText(this.buttonText).setCta().onClick(() => {
					const completeEntity: TEntity = {
						...this.entity,
						entity: slugify(this.entity.label || ''),
						fields: this.entity.fields
					}

					createEntitySchema(this.app, completeEntity)
				})
			);
	}

	onClose() {
		if (!this.isSubmited) {
			new Notice("You close before saving. Nothing was created");
			const { contentEl } = this;
			contentEl.empty();
		}
	}
}


