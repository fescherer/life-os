import { setIcon, Setting } from "obsidian";
import { TEntity, TField, TTypeField } from "src/types/field";
import { slugify } from "src/utils/slugify";
import { renderSelect } from "./render-select";
import { renderNumber } from "./render-number";

function renderSchema(entity: TEntity, wrapper: HTMLElement) {
	entity.fields.forEach((field, idx) => {
		field.id = idx;
		renderField(entity, wrapper, field)
	});
}

export function renderField(entity: TEntity, wrapper: HTMLElement, newField: TField) {
	const fieldWrapperContainer = wrapper.createDiv({ cls: 'flex' });

	const fieldOrderContainer = fieldWrapperContainer.createDiv({ cls: 'my-vertical-button-wrapper' })
	const btnUp = fieldOrderContainer.createEl("button");
	setIcon(btnUp, 'chevron-up')
	btnUp.onclick = () => changeFieldOrder(wrapper, 'up', newField, entity);

	const btnDown = fieldOrderContainer.createEl("button");
	setIcon(btnDown, 'chevron-down')
	btnDown.onclick = () => changeFieldOrder(wrapper, 'down', newField, entity);

	const typeContainer = fieldWrapperContainer.createDiv({ cls: "field-group-wrapper" });
	const deleteBtn = typeContainer.createDiv({ cls: "delete-icon" });
	setIcon(deleteBtn, "trash");

	deleteBtn.onclick = () => {
		entity.fields.remove(newField)
		fieldWrapperContainer.remove()
	};


	new Setting(typeContainer)
		.setName("Field Name")
		.addText(text => {
			text.setValue(newField ? newField.label : '')
			text.onChange(val => {
				newField.label = val
				newField.name = slugify(val)
			})
		})

	new Setting(typeContainer).setName("Field Type")
		.addDropdown(drop =>
			drop.addOptions({
				"string": "String",
				"number": "Number",
				"boolean": "Boolean",
				"date": "Date",
				"select": "Select",
				"url": "Url",
				"file": "File",
				"array": "Array",
				"markdown": "Markdown"
			}).setValue(newField ? newField.type : '')
				.onChange((newType: TTypeField) => {
					newField.type = newType

					switch (newField.type) {
						case 'select':
							renderSelect(newField, typeContainer)
							break
						case 'number':
							renderNumber(newField, typeContainer)
							break
						default:
							break
					}
				})
		);
}

function changeFieldOrder(wrapper: HTMLElement, direction: 'up' | 'down', changePositionField: TField, entity: TEntity) {
	wrapper.empty()
	const index = entity.fields.findIndex(field => field.id === changePositionField.id);

	if (index === -1) return;

	if (direction === 'up' && index > 0) {
		[entity.fields[index - 1], entity.fields[index]] = [entity.fields[index], entity.fields[index - 1]];
	} else if (direction === 'down' && index < entity.fields.length - 1) {
		[entity.fields[index + 1], entity.fields[index]] = [entity.fields[index], entity.fields[index + 1]];
	}

	renderSchema(entity, wrapper)
}
