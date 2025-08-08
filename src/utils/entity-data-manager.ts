import { App, Notice } from "obsidian";
import { getCurrentFolder } from "./folderName";
import { TData, TDataItem } from "src/types/data";
import { readMDFile, updateOrCreateFileWithPath, updateOrCreateMDFile } from "./markdown-manager";
import { slugify } from "./slugify";
import { ConfirmDialog } from "./confirmDialog";
import { getEntitySchema } from "./entity-schema-manager";
import { TValidate } from "src/types/util";

/*
    * Update data.md file with new data (Create files and markdown if necessary).
    * @param app - Obsidian app object.
    * @param dataItem - creates new data item base on schema.
    * @returns TData item or null.
*/
export async function createEntityData(app: App, dataItem: TDataItem): Promise<TData | null> {
    dataItem.createdAt = new Date().toISOString()
    dataItem.updatedAt = new Date().toISOString()

    const validate = await validateEntityDataItem(app, dataItem)
    if (validate.isValid) {
        const currentFolder = await getCurrentFolder(app)
        const entitySchema = await getEntitySchema(app)
        const entityData = await getEntityData(app)
        if (!entityData || !entitySchema) return null

        // Create markdown files with there is markdown fields
        entitySchema.fields.filter(item => item.type === 'markdown').forEach(markdownfield => {
            const filePath = `md/${slugify(dataItem.name)}-${dataItem.id}-${markdownfield.id}.md`
            updateOrCreateFileWithPath(app, `${currentFolder}/${filePath}`, '# MD File. Do not change the file Name\n')
        });

        const newIdCount = (entityData.idCount + 1)
        dataItem.id = newIdCount.toString().padStart(3, '0')

        const completeData: TData = {
            ...entityData,
            idCount: newIdCount,
            data: [...entityData.data, dataItem]
        }
        const jsonString = JSON.stringify(completeData, null, 2);
        const success = await updateOrCreateMDFile(app, `${currentFolder}/data.md`, jsonString)
        return success ? completeData : null
    }

    else {
        new Notice(`Fill all the fields! ${validate.missingFields}`)
        return null
    }
}


/*
    * Update data.md file.
    * @param app - Obsidian app object.
    * @returns TData item or null.
*/
export async function updateEntityData(app: App, dataItem: TDataItem) {
    dataItem.updatedAt = new Date().toISOString()

    const validate = await validateEntityDataItem(app, dataItem)
    if (validate.isValid) {
        const currentFolder = await getCurrentFolder(app)
        const entityData = await getEntityData(app)
        if (!entityData) return null

        new ConfirmDialog(app, 'Are you sure you want to update this item?', async () => {
            const completeData = {
                ...entityData,
                data: [...entityData.data.filter(item => item.id != dataItem.id), dataItem].sort((a, b) => Number(a.id) - Number(b.id))
            }
            const jsonString = JSON.stringify(completeData, null, 2);

            const success = await updateOrCreateMDFile(app, `${currentFolder}/data.md`, jsonString)
            return success ? completeData : null
        }, () => {
            new Notice('You canceled the edit')
        }).open()
    } else {
        new Notice(`Fill all the fields! ${validate.missingFields}`)
        return null
    }
}

/*
    * Validate data item base on data schema.
    * @param app - Obsidian app object.
    * @returns TData item or null.
*/
export async function validateEntityDataItem(app: App, data: TDataItem): Promise<TValidate> {
    const entitySchema = await getEntitySchema(app)
    if (!entitySchema) return {
        isValid: false,
        missingFields: []
    }

    const missingFields = [];

    for (const field of entitySchema.fields) {
        const value = data[field.name];

        const isEmpty = value === undefined || value === null

        if (isEmpty)
            missingFields.push(field.name);
    }

    return {
        isValid: missingFields.length === 0,
        missingFields
    };
}


/*
    * Read data.md markdown file of current folder.
    * @param app - Obsidian app object.
    * @returns TData item or null.
*/
export async function getEntityData(app: App): Promise<TData | null> {
    const currentFolder = await getCurrentFolder(app)
    const data = readMDFile(this.app.vault, `${currentFolder}/data.md`) as Promise<TData>
    if (!data) new Notice('Fail to load data.md')
    return data
}


/*
    * Moves data to trash folder in vault.
    * @param app - Obsidian app object.
    * @param dataId - Id of the data.
    * @returns True if success, false if fails.
*/
export async function deleteEntityDataItem(app: App, data: TDataItem): Promise<TDataItem | null> {
    const currentFolder = await getCurrentFolder(app)

    try {
        const randomId = crypto.randomUUID()
        // Verify if trash folder exists, if not, create one

        // Create a md file inside the trash folder containing the data info, the name of the md should contain the generated randomID

        // Verify if the data contains file data like markdown or file, if yes, move those files to the trash folder with the generated id

        // Delelete the data from the main file

        // return the data containing in the new file, this ensures that data is moved
        return data
    } catch {
        return null
    }
}
