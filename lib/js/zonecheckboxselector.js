class SelectionTool {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'mouseselection';

        this.container.prepend(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.rect = {};
        this.resize(null);

        window.addEventListener("resize", (e) => this.resize());

        window.addEventListener("mousedown", (e) => this.startSelection(e));
        window.addEventListener("mousemove", (e) => this.updateSelection(e));
        window.addEventListener("mouseup", (e) => this.endSelection(e));

        // Gestion pour les appareils tactiles
        this.canvas.addEventListener("touchstart", (e) => this.startSelection(e.touches[0]));
        this.canvas.addEventListener("touchmove", (e) => this.updateSelection(e.touches[0]));
        this.canvas.addEventListener("touchend", (e) => this.endSelection(e.changedTouches[0]));
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    startSelection(e) {
        this.resize();
        const canvas = this.canvas.getBoundingClientRect();
        if(e.clientX >= canvas.left && e.clientX <= canvas.left + canvas.width && e.clientY >= canvas.top && e.clientY <= canvas.top + canvas.height)
        {
            this.isDrawing = true;

            this.startX = e.clientX - canvas.left;
            this.startY = e.clientY - canvas.top;

            this.rect = {};
            return false;
        }
    }

    updateSelection(e) {
        if (!this.isDrawing) return;
        const canvas = this.canvas.getBoundingClientRect();
        const x = Math.max(0,e.clientX - canvas.left);
        const y = Math.max(0,e.clientY - canvas.top);

        const rectStartX = Math.min(this.startX, x);
        const rectStartY = Math.min(this.startY, y);
        this.rect = {
            x: rectStartX,
            y: rectStartY,
            width: Math.min(this.canvas.width - rectStartX, Math.abs(x - this.startX)),
            height: Math.min(this.canvas.height - rectStartY, Math.abs(y - this.startY)),
        };

        // Dessin de la zone de sélection
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "rgba(0, 0, 255, 0.2)";
        this.context.fillRect(this.rect.x, this.rect.y, this.rect.width+'px', this.rect.height+'px');
        this.context.strokeStyle = "blue";
        this.context.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }

    endSelection() {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Vérification des cases à cocher incluses dans la zone
        const rect = this.rect;
        document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
            const boxRect = checkbox.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            const boxX = boxRect.left - canvasRect.left;
            const boxY = boxRect.top - canvasRect.top;

            if (
                boxX >= rect.x &&
                boxY >= rect.y &&
                boxX + boxRect.width <= rect.x + rect.width &&
                boxY + boxRect.height <= rect.y + rect.height
            ) {
                checkbox.checked = !checkbox.checked;
            }
        });

        this.startX = 0;
        this.startY = 0;
        this.rect = {};
    }
}

