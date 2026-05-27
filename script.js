console.log("FitSlim site loaded");

document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector("h1");

  if (title) {
    title.addEventListener("click", () => {
      alert("FitSlim працює!");
    });
  }
});
