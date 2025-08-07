export function showContextMenu(
    cardId: string,
    x: number,
    y: number,
    actions: {
        onEdit: () => void;
        onDelete: () => void;
    }
) {
    // Remove any existing menu
    const existing = document.querySelector(".card-context-menu");
    if (existing) existing.remove();

    // Create new menu
    const menu = document.createElement("div");
    menu.className = "card-context-menu";
    menu.style.position = "absolute";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.zIndex = "1000";
    menu.innerHTML = `
    <div class="menu-item">Edit</div>
    <div class="menu-item">Delete</div>
  `;

    // Attach menu to DOM
    document.body.appendChild(menu);

    // Handle menu actions
    menu.querySelector(".menu-item:nth-child(1)")?.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent click from bubbling
        actions.onEdit();
        menu.remove();
    });

    menu.querySelector(".menu-item:nth-child(2)")?.addEventListener("click", (e) => {
        e.stopPropagation();
        actions.onDelete();
        menu.remove();
    });

    // Listen for *any* click to close the menu
    const clickToClose = (event: MouseEvent) => {
        // Always remove the menu
        menu.remove();

        // Remove this listener after first click
        document.removeEventListener("click", clickToClose);
    };

    // Delay listener attachment to avoid closing immediately after open
    setTimeout(() => {
        document.addEventListener("click", clickToClose, true);
    }, 0);
}