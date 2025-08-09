import { App, Notice } from "obsidian";
import { DetailsModal } from "src/modal/details/modal";
import { showContextMenu } from "../context-menu";
import { ModalDataForm } from "src/modal/data/modal";
import { deleteEntityDataItem, getEntityData } from "src/utils/entity-data-manager";

export class CardInteractionManager {
	private selectedCards = new Set<string>();
	cont;

	constructor(private app: App, private container: HTMLElement) {
		this.initializeListeners();
		this.observeDOM();
		this.cont = this.container.createDiv()
	}


	private initializeListeners() {
		this.container.addEventListener("click", this.onClick.bind(this));
		this.container.addEventListener("dblclick", this.onDoubleClick.bind(this));
		this.container.addEventListener("contextmenu", this.onRightClick.bind(this));
		document.addEventListener("click", this.onDocumentClick.bind(this));
	}

	private onClick(e: MouseEvent) {
		const cardEl = (e.target as HTMLElement).closest(".card") as HTMLElement;

		if (cardEl && this.container.contains(cardEl)) {
			e.stopPropagation();
			const cardId = String(cardEl?.dataset?.cardId)

			this.clearSelection()

			this.selectedCards.add(cardId);
			cardEl.classList.add("card-selected");

			// ;

			// if (this.selectedCards.has(cardId)) {
			// 	this.selectedCards.delete(cardId);
			// 	cardEl.classList.remove("card-selected");
			// } else {
			// 	this.selectedCards.add(cardId);
			// 	cardEl.classList.add("card-selected");
			// }
		}
		this.cont.textContent = JSON.stringify(Array.from(this.selectedCards))
	}

	private async onDoubleClick(e: MouseEvent) {
		const cardEl = (e.target as HTMLElement).closest(".card") as HTMLElement;
		if (cardEl && this.container.contains(cardEl)) {
			const cardId = cardEl.dataset.cardId;

			const data = await getEntityData(this.app)
			if (!data) return;

			const cardData = data.data.find(item => `card-${item.id}` === cardId)
			if (cardData)
				new DetailsModal(this.app, cardData).open();
			else
				new Notice('Data not found')
		}
	}

	private async onRightClick(e: MouseEvent) {
		e.preventDefault();
		const cardEl = (e.target as HTMLElement).closest(".card") as HTMLElement;
		if (cardEl && this.container.contains(cardEl)) {
			const cardId = cardEl.dataset.cardId;
			const data = await getEntityData(this.app)
			if (!data) return;

			const cardData = data.data.find(item => `card-${item.id}` === cardId)
			if (cardData && cardId)
				showContextMenu(cardId, e.pageX, e.pageY, {
					onDelete: () => deleteEntityDataItem(this.app, cardData),
					onEdit: () => new ModalDataForm(this.app, cardData).open(),
				});
		}
	}

	private onDocumentClick(e: MouseEvent) {
		const clickedInside = (e.target as HTMLElement).closest(".card");
		if (!clickedInside) this.clearSelection();
		this.cont.textContent = JSON.stringify(Array.from(this.selectedCards))
	}

	private clearSelection() {
		this.selectedCards.forEach(id => {
			const el = this.container.querySelector(`[data-card-id="${id}"]`);
			el?.classList.remove("card-selected");
		});
		this.selectedCards.clear();
	}

	private observeDOM() {
		const observer = new MutationObserver(() => {
			// Can be used to rebind styles if needed
		});
		observer.observe(this.container, { childList: true, subtree: true });
	}

	public getSelectedCards(): string[] {
		return Array.from(this.selectedCards);
	}
}
