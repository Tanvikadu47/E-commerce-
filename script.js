function showLogin() {
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('signup').classList.add('hidden');
    document.getElementById('gallery').classList.add('hidden');
}

function showSignup() {
    document.getElementById('signup').classList.remove('hidden');
    document.getElementById('login').classList.add('hidden');
    document.getElementById('gallery').classList.add('hidden');
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById('message').innerText = data.message;
        document.getElementById('login').classList.add('hidden');
        document.getElementById('signup').classList.add('hidden');
        populateGallery();
    } else {
        document.getElementById('message').innerText = data.message;
    }
}

async function signup() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const phone = document.getElementById('signupPhone').value;

    const response = await fetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, phone })
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById('message').innerText = data.message;
        document.getElementById('signup').classList.add('hidden');
        populateGallery();
    } else {
        document.getElementById('message').innerText = data.error;
    }
}

async function populateGallery() {
    const response = await fetch('/products');
    const items = await response.json();
    const gallery = document.getElementById('galleryItems');

    gallery.innerHTML = ''; // Clear existing items
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'card'; // Change to 'card' for consistency
        itemDiv.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.product_name}">
            <h2>${item.product_name}</h2>
            <p>${item.description}</p>
            <p class="price">₹${item.amount}</p>
            <button class="buy-now" onclick="buyNow('${item.id}')">Buy Now</button>
        `;
        gallery.appendChild(itemDiv);
    });

    // Hide login and signup forms and the login button after gallery is populated
    document.getElementById('login').classList.add('hidden');
    document.getElementById('signup').classList.add('hidden');
    document.querySelector('.button-container').classList.add('hidden'); // Hide the buttons

    // Show the gallery
    document.getElementById('gallery').classList.remove('hidden'); 
}

// Function to handle buying a product
function buyNow(productId) {
    // Fetch product details to get the price
    fetch(`/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('productPrice').value = product.amount;
            document.getElementById('purchaseModal').classList.remove('hidden');
        })
        .catch(err => console.error(err));
}

function closeModal() {
    document.getElementById('purchaseModal').classList.add('hidden');
}

// Handle the form submission
document.getElementById('purchaseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('purchaserName').value;
    const contact = document.getElementById('purchaserContact').value;
    const address = document.getElementById('purchaserAddress').value;
    const email = document.getElementById('purchaserEmail').value;
    const price = document.getElementById('productPrice').value;

    // Send this data to your server for processing
    fetch('/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, address, email, price })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        closeModal();
    })
    .catch(err => console.error(err));
});
