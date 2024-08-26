window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  var scrollButton = document.querySelector(".scroll_top");
  if (
    document.body.scrollTop > 300 ||
    document.documentElement.scrollTop > 300
  ) {
    scrollButton.style.display = "block";
  } else {
    scrollButton.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const carContainer = document.getElementById("carContainer");
  const searchInput = document.getElementById("searchInput");
  const conditionFilter = document.getElementById("conditionFilter");
  const priceFilter = document.getElementById("priceFilter");
  const tagMenu = document.getElementById("tagMenu");
  const noProductsMessage = document.createElement("div"); // Create a container for the message
  noProductsMessage.className = "alert alert-warning d-none"; // Initially hidden
  noProductsMessage.textContent = "No products found";

  let allCars = [];
  let selectedTags = [];
  let selectedType = null;

  // Fetch data from JSON file
  fetch("cars2.json")
    .then((response) => response.json())
    .then((data) => {
      allCars = data;
      displayTags(data);
      displayCars(data);

      // Add event listeners for filtering
      searchInput.addEventListener("input", filterAndDisplayCars);
      conditionFilter.addEventListener("change", filterAndDisplayCars);
      priceFilter.addEventListener("change", filterAndDisplayCars);

      // Filter cars by tag
      tagMenu.addEventListener("click", function (event) {
        if (event.target.tagName === "A") {
          const tag = event.target.getAttribute("data-tag");
          if (selectedTags.includes(tag)) {
            selectedTags = selectedTags.filter((t) => t !== tag);
            event.target.classList.remove("active");
          } else {
            selectedTags.push(tag);
            event.target.classList.add("active");
          }
          filterAndDisplayCars();
        }
      });

      // Handle clicks on new list items
      document
        .querySelector('a[href="#basic"]')
        .addEventListener("click", function (event) {
          event.preventDefault();
          selectedType = "basic";
          filterAndDisplayCars();
        });
      document
        .querySelector('a[href="#th"]')
        .addEventListener("click", function (event) {
          event.preventDefault();
          selectedType = "th";
          filterAndDisplayCars();
        });
      document
        .querySelector('a[href="#sth"]')
        .addEventListener("click", function (event) {
          event.preventDefault();
          selectedType = "sth";
          filterAndDisplayCars();
        });
    })
    .catch((error) => console.error("Error fetching car data:", error));

  // Function to display cars
  function displayCars(cars) {
    carContainer.innerHTML = "";
    if (cars.length === 0) {
      carContainer.appendChild(noProductsMessage);
      noProductsMessage.classList.remove("d-none"); // Show the message
    } else {
      noProductsMessage.classList.add("d-none"); // Hide the message
      cars.forEach((car) => {
        const card = document.createElement("div");
        card.className = "col-md-4 pt-2";
        card.innerHTML = `
          <div class="card">
            <img src="${car.image}" class="card-img-top" alt="${car.name}">
            <div class="card-body">
                <h5 class="card-title">${car.name}</h5>
                <p class="card-text price ${car.condition}">${car.price}</p>
              <div class="card-details">
                <p class="card-text condition">${car.condition}</p>
                <p class="card-text stock">Stock: ${car.stock}</p>
              </div>
            </div>
          </div>
        `;
        carContainer.appendChild(card);
      });
    }
  }

  // Function to display tags in the menu
  function displayTags(cars) {
    const tags = new Set();
    cars.forEach((car) => car.tags.forEach((tag) => tags.add(tag)));

    tagMenu.innerHTML = Array.from(tags)
      .map(
        (tag) => `
          <a class="dropdown-item" href="#" data-tag="${tag}">${tag}</a>
      `
      )
      .join("");
  }

  // Function to filter cars based on search, price, condition, type, and tags
  function filterAndDisplayCars() {
    const query = searchInput.value.toLowerCase();
    const condition = conditionFilter.value;
    const priceRange = priceFilter.value;
    const [minPrice, maxPrice] = priceRange
      ? priceRange.split("-").map(Number)
      : [0, Infinity];

    const filteredCars = allCars.filter((car) => {
      const carPrice = parseInt(car.price.replace("đ", ""), 10);
      const matchesSearch = car.name.toLowerCase().includes(query);
      const matchesCondition = !condition || car.condition === condition;
      const matchesPrice = carPrice >= minPrice && carPrice <= maxPrice;
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => car.tags.includes(tag));
      const matchesType = !selectedType || car.type === selectedType;

      return (
        matchesSearch &&
        matchesCondition &&
        matchesPrice &&
        matchesTags &&
        matchesType
      );
    });

    displayCars(filteredCars);
  }
});
