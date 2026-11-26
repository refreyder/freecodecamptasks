const resultEl = document.getElementById("jsonResult");

document.getElementById("singleForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const stock = form.stock.value;
    const like = form.like.checked;
    const res = await fetch(`/api/stock-prices?stock=${encodeURIComponent(stock)}&like=${like}`);
    const data = await res.json();
    resultEl.textContent = JSON.stringify(data, null, 2);
});

document.getElementById("compareForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const stock1 = form.stock1.value;
    const stock2 = form.stock2.value;
    const like = form.like.checked;
    const res = await fetch(
        `/api/stock-prices?stock=${encodeURIComponent(stock1)}&stock=${encodeURIComponent(stock2)}&like=${like}`
    );
    const data = await res.json();
    resultEl.textContent = JSON.stringify(data, null, 2);
});
