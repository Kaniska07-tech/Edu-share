const donateForm = document.querySelector("#donate form");
const requestForm = document.querySelector("#request form");
const cardsContainer = document.querySelector(".cards");

let donations = [];


donateForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let inputs = donateForm.querySelectorAll("input");

    let item = {
        name: inputs[0].value,
        category: inputs[1].value,
        subject: inputs[2].value,
        location: inputs[3].value
    };

    donations.push(item);
    addCard(item);

    donateForm.reset();
});

function addCard(item) {
    let card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.subject || item.category}</p>
        <span>${item.location}</span>
        <button class="request-btn">Request</button>
    `;


    card.querySelector(".request-btn").addEventListener("click", () => {
        alert(`Request sent for ${item.name}`);
    });

    cardsContainer.appendChild(card);
}


requestForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let inputs = requestForm.querySelectorAll("input");

    let requestItem = inputs[0].value.toLowerCase();


    let matches = donations.filter(d =>
        d.name.toLowerCase().includes(requestItem) ||
        d.subject.toLowerCase().includes(requestItem)
    );

    if (matches.length > 0) {
        alert("Matching items found! Scroll down to view.");
    } else {
        alert("No match found yet. Try again later.");
    }

    requestForm.reset();
});

document.querySelector(".hero button").addEventListener("click", () => {
    document.querySelector("#donate").scrollIntoView({
        behavior: "smooth"
    });
});