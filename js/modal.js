const modalContainers = document.querySelectorAll(".modal-container");
const modalButtons = document.querySelectorAll(".modal-button");

modalContainers.forEach((mc) => {
    mc.classList.add("hidden");
    mc.onclick = () => {
        mc.classList.add("hidden");
    }
})

modalButtons.forEach(mb => {
    mb.addEventListener("click", () => {
        const targetModalID = mb.getAttribute("modal-target");
        if (targetModalID == null) return;
        const targetModal = document.getElementById(targetModalID);
        if (targetModal == null) return;
        targetModal.parentElement.classList.toggle("hidden");
    })
})