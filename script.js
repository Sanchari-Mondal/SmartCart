const products = [
    {id:1,name:"Blush Minimal Watch",category:"Watches",price:1899,image:"images/pinkwatch.jpeg",color:"#f9dce8"},
    {id:2,name:"Lavender Watch",category:"Watches",price:2499,image:"images/purplewatch.jpeg",color:"#e9e1fa"},
    {id:3,name:"Rose Gold Watch",category:"Watches",price:3299,image:"images/peachwatch.jpeg",color:"#ffede1"},

    {id:4,name:"Everyday Tote",category:"Bags",price:1299,image:"images/tote.jpeg",color:"#f9dce8"},
    {id:5,name:"Lilac Sling Bag",category:"Bags",price:1599,image:"images/sling.jpeg",color:"#e9e1fa"},
    {id:6,name:"Sage Backpack",category:"Bags",price:2199,image:"images/sage.jpeg",color:"#e1f1df"},
    {id:7,name:"Weekend Duffle",category:"Bags",price:2799,image:"images/baggs.jpeg",color:"#ffede1"},

    {id:8,name:"Cloud Sneakers",category:"Shoes",price:2399,image:"images/whiteshoe.jpeg",color:"#e9e1fa"},
    {id:9,name:"Pink Slides",category:"Shoes",price:899,image:"images/pinksandle.jpeg",color:"#f9dce8"},
    {id:10,name:"Sage Trainers",category:"Shoes",price:2899,image:"images/greenshoe.jpeg",color:"#e1f1df"},
    {id:11,name:"Street Sneakers",category:"Shoes",price:3199,image:"images/blackshoe.jpeg",color:"#ffede1"},

    {id:12,name:"Rose Gold Shades",category:"Sunglasses",price:1199,image:"images/purplesun.jpeg",color:"#f9dce8"},
    {id:13,name:"Lilac Frames",category:"Sunglasses",price:999,image:"images/WhatsApp Image 2026-11-20 at 10.39.55 PM.jpeg",color:"#e9e1fa"},
    {id:14,name:"Black Shades",category:"Sunglasses",price:1499,image:"images/blacksun.jpeg",color:"#ffede1"},

    {id:15,name:"Pastel Steel Bottle",category:"Water Bottles",price:699,image:"images/WhatsApp Image 2026-11-20 at 10.35.56 PM.jpeg",color:"#e1f1df"},
    {id:16,name:"Sage Insulated Flask",category:"Water Bottles",price:1099,image:"images/whitebottle.jpeg",color:"#e1f1df"},
    {id:17,name:"Lavender Sipper",category:"Water Bottles",price:549,image:"images/glassbottle.jpeg",color:"#e9e1fa"},
    {id:18,name:"Blush Glass Bottle",category:"Water Bottles",price:799,image:"images/WhatsApp Image 2026-11-20 at 10.50.05 PM.jpeg",color:"#f9dce8"},

    {id:19,name:"Mini Travel Watch",category:"Watches",price:1799,image:"images/brownwatch.jpeg",color:"#ffede1"},
    {id:20,name:"Quilted Party Sling",category:"Bags",price:1999,image:"images/sling1.jpeg",color:"#e9e1fa"}

];

// 10 VALID DEMO MEMBERSHIP IDs

const validIDs = {
    "SC-MEM-1001":"member",
    "SC-MEM-1002":"member",
    "SC-MEM-1003":"member",
    "SC-PRM-2001":"premium",
    "SC-PRM-2002":"premium",
    "SC-PRM-2003":"premium",
    "SC-VIP-3001":"vip",
    "SC-VIP-3002":"vip",
    "SC-VIP-3003":"vip",
    "SC-VIP-3004":"vip"
};

let cart = [];
let verifiedID = "";
let lastCalculation = null;

function money(n) {
    return "₹" + Number(n).toLocaleString("en-IN", {
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });
}

let toastTimer;

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast visible ${type}`;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

// PAGE NAVIGATION

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    document.getElementById(page).classList.add("active");

    if(page === "checkout") renderCheckout();

    window.scrollTo(0,0);
}

// DISPLAY PRODUCTS

function displayProducts(list) {
    const container = document.getElementById("products");

    container.innerHTML = "";

    list.forEach(p => {
        container.innerHTML += `
        <div class="product-card">

            <div class="product-image" style="background:${p.color}">
                <img src="${p.image}" alt="${p.name}">
            </div>

            <div class="product-info">
                <h3>${p.name}</h3>
                <p>${p.category}</p>

                <div class="price-row">
                    <b>${money(p.price)}</b>

                    <button class="add-btn"
                    onclick="addToCart(${p.id})">
                        + Add
                    </button>
                </div>
            </div>

        </div>
        `;
    });

}

function filterProducts(category) {
    if(category === "All") {
        displayProducts(products);
    } else {
        displayProducts(
            products.filter(p => p.category === category)
        );
    }
}

// ADD TO CART

function addToCart(id) {
    const product = products.find(p => p.id === id);

    const existing = cart.find(p => p.id === id);

    if(existing) {
        existing.quantity++;
    } else {
        cart.push({...product, quantity:1});
    }

    updateCart();
    showToast(product.name + " added to cart!");
}

function updateCart() {
    const count = cart.reduce((sum,p) => sum+p.quantity,0);

    document.getElementById("cartCount").textContent = count;

    const total = getSubtotal();

    document.getElementById("subtotal").textContent = money(total);

    renderCheckout();
}

function getSubtotal() {
    return cart.reduce((sum,p) => sum + p.price*p.quantity,0);
}

// CHECKOUT CART

function renderCheckout() {
    const container = document.getElementById("checkoutItems");

    if(cart.length === 0) {
        container.innerHTML = "Your bag is empty.";
    } else {
        container.innerHTML = "";

        cart.forEach(p => {
            container.innerHTML += `
            <div class="checkout-item">
                <span>${p.name} × ${p.quantity}</span>

                <span>
                    ${money(p.price*p.quantity)}

                    <button class="remove-btn"
                    onclick="removeItem(${p.id})">
                    Remove
                    </button>
                </span>
            </div>
            `;
        });
    }

    document.getElementById("checkoutTotal").textContent =
        money(lastCalculation ? lastCalculation.final_price : getSubtotal());
}

function removeItem(id) {
    cart = cart.filter(p => p.id !== id);
    lastCalculation = null;
    updateCart();
}

function goToCalculator() {
    if(cart.length === 0) {
        showToast("Your cart is empty!", "error");
        return;
    }

    showPage("calculator");
}

function openPaymentCheckout() {
    if(!lastCalculation) {
        showToast("Please calculate your discount first.", "error");
        return;
    }

    showPage("checkout");
    document.getElementById("paymentPanel").hidden = false;
    document.getElementById("checkoutCalculateBtn").hidden = true;
}

// MEMBERSHIP AUTHENTICATION

function verifyID() {
    const customer = document.getElementById("customer").value;

    const id = document.getElementById("membershipId")
        .value.trim().toUpperCase();

    const status = document.getElementById("authStatus");

    if(customer === "guest") {
        verifiedID = "";
        status.textContent = "Guest checkout selected.";
        return true;
    }

    if(!id) {
        status.textContent = "Please enter your membership ID.";
        verifiedID = "";
        return false;
    }

    if(validIDs[id] === customer) {
        verifiedID = id;

        status.textContent =
            "✓ Membership successfully verified!";

        status.style.color = "green";

        return true;
    }

    verifiedID = "";

    status.textContent =
        "Invalid ID or incorrect membership type.";

    status.style.color = "red";

    return false;
}

// DISCOUNT CALCULATOR

async function calculateDiscount() {

    if(cart.length === 0) {
        showToast("Please add products to your cart first.", "error");
        return;
    }

    const customer = document.getElementById("customer").value;

    if(customer !== "guest") {
        if(!verifyID()) return;
    }

    const total = getSubtotal();

    const quantity = cart.reduce(
        (sum,p) => sum+p.quantity,0
    );

    const payload = {
        total:total,
        customer:customer,
        membership_id:verifiedID,
        season:document.getElementById("season").value,
        coupon:document.getElementById("coupon").value.trim(),
        quantity:quantity,
        first_order:document.getElementById("firstOrder").checked
    };

    try {

        const response = await fetch("/discount", {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(payload)
        });

        const data = await response.json();

        if(!response.ok || !data.success) {
            throw new Error(data.error || "Calculation failed.");
        }

        lastCalculation = data;

        displayResult(data);

    } catch(error) {

        showToast("Error: " + error.message, "error");

    }
}

// DISPLAY BACKEND RESULTS

function displayResult(data) {

    document.getElementById("emptyResult").hidden = true;

    document.getElementById("result").hidden = false;

    document.getElementById("rSubtotal").textContent =
        money(data.subtotal);

    document.getElementById("rMember").textContent =
        "-" + money(data.membership_discount);

    document.getElementById("rCart").textContent =
        "-" + money(data.cart_discount);

    document.getElementById("rSeason").textContent =
        "-" + money(data.seasonal_discount);

    document.getElementById("rCoupon").textContent =
        "-" + money(data.coupon_discount);

    document.getElementById("rQuantity").textContent =
        "-" + money(data.quantity_discount);

    document.getElementById("rFirst").textContent =
        "-" + money(data.first_order_discount);

    document.getElementById("rDelivery").textContent =
        money(data.delivery);

    document.getElementById("rSavings").textContent =
        money(data.savings);

    document.getElementById("rFinal").textContent =
        money(data.final_price);

    document.getElementById("couponMessage").textContent =
        data.coupon_message + " " +
        data.quantity_message + " " +
        data.first_order_message;

    document.getElementById("checkoutTotal").textContent =
        money(data.final_price);
}

// BUY NOW

function buyNow() {

    if(cart.length === 0) {
        showToast("Your cart is empty!", "error");
        return;
    }

    if(!lastCalculation) {
        showToast("Please calculate your discount first.", "error");
        showPage("calculator");
        return;
    }

    const payment = document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    const orderID = "SC-ORD-" +
        Math.floor(100000 + Math.random()*900000);

    document.getElementById("orderMessage").innerHTML = "";
    document.getElementById("successOrderDetails").innerHTML = `
        <strong>Order ID:</strong> ${orderID}<br>
        <strong>Payment Method:</strong> ${payment}<br>
        <strong>Total Amount:</strong> ${money(lastCalculation.final_price)}<br>
        <small>Demo order only. No real payment processed.</small>
    `;
    document.getElementById("successModal").hidden = false;

    cart = [];
    lastCalculation = null;
    updateCart();
    document.getElementById("paymentPanel").hidden = true;
    document.getElementById("checkoutCalculateBtn").hidden = false;
    document.getElementById("result").hidden = true;
    document.getElementById("emptyResult").hidden = false;
}

function closeSuccessModal() {
    document.getElementById("successModal").hidden = true;
    showPage("shop");
}

// INITIAL LOAD

displayProducts(products);
updateCart();
