export const openCartModal = () => {
  const bootstrap = require("bootstrap"); // dynamically import bootstrap
  const cartEl = document.getElementById("shoppingCart");

  // Cart modal zaten açıksa tekrar hide/show yapma (flicker / kapanıp-açılma)
  if (cartEl && cartEl.classList.contains("show")) return;

  const modalElements = document.querySelectorAll(".modal.show");
  modalElements.forEach((modal) => {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
  });


  // Close any open offcanvas
  const offcanvasElements = document.querySelectorAll(".offcanvas.show");
  offcanvasElements.forEach((offcanvas) => {
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
    if (offcanvasInstance) {
      offcanvasInstance.hide();
    }
  });
  var myModal = new bootstrap.Modal(cartEl, {
    keyboard: false,
  });

  myModal.show();
  document
    .getElementById("shoppingCart")
    .addEventListener(
      "hidden.bs.modal",
      () => {
      myModal.hide();
      },
      { once: true }
    );
};
