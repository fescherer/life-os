import { Setting } from "obsidian";
import { TSelectField } from "src/types/field";

export function renderSelect(field: TSelectField, container: HTMLDivElement) {
    if (!field.options) field.options = []

    const optionsContainer = container.createDiv();
    new Setting(container).addButton((btn) => {
        if (field.options.length > 0) {
            field.options.map(option => {
                const optionContainer = optionsContainer.createDiv();
                new Setting(optionContainer).setName("Option name")
                    .addText(text => text.onChange(val => (option.title = val)))
                    .addButton((btn) => {
                        btn.setIcon('trash').onClick(() => {
                            field.options.map(item => item.id === option.id && field.options.remove(item))
                            optionContainer.remove()
                        })
                    });
            })
        }
        let countOptions = field.options.length ? field.options.length : 0

        btn.setIcon('plus').onClick(() => {
            const optionContainer = optionsContainer.createDiv();
            countOptions += 1

            const newOption = {
                id: countOptions.toString(),
                title: ''
            }
            field.options.push(newOption)
            new Setting(optionContainer).setName("Option name")
                .addText(text => text.onChange(val => (newOption.title = val)))
                .addButton((btn) => {
                    btn.setIcon('trash').onClick(() => {
                        field.options.map(item => item.id === newOption.id && field.options.remove(item))
                        optionContainer.remove()
                    })
                });
        })
    })
}