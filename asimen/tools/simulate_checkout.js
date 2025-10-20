// simulate_checkout.js
// Simulate the checkout flow against json-server API at localhost:3001

const API = 'http://localhost:3001';

async function main() {
  try {
    // Use user id 2 (Mai) from db.json
    const userId = "2";

    // pick a variant to buy
    const variantsRes = await fetch(`${API}/product_variants`);
    if (!variantsRes.ok) throw new Error('Cannot get variants');
    const variants = await variantsRes.json();
    const variant = variants[0];
    if (!variant) throw new Error('No variants available');

    const productId = variant.product_id;
    const variantId = variant.id;
    const qty = 1;

    console.log('Using variant', variantId, 'product', productId);

    // Create order
    const order = { user_id: userId, created_date: new Date().toISOString(), status: 'pending' };
    let res = await fetch(`${API}/orders`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order)
    });
    if (!res.ok) {
      const t = await res.text().catch(()=>'');
      throw new Error('Create order failed: ' + res.status + ' ' + t);
    }
    const newOrder = await res.json();
    console.log('Created order', newOrder.id);

    // Create order_detail
    const detail = { order_id: newOrder.id, product_id: productId, quantity: qty, unit_price: variant.price };
    res = await fetch(`${API}/order_details`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(detail) });
    if (!res.ok) {
      const t = await res.text().catch(()=>'');
      throw new Error('Create order_detail failed: ' + res.status + ' ' + t);
    }
    const createdDetail = await res.json();
    console.log('Created order_detail', createdDetail.id || createdDetail);

    // Update variant quantity
    const vRes = await fetch(`${API}/product_variants/${variantId}`);
    if (!vRes.ok) throw new Error('Cannot get variant ' + variantId);
    const vObj = await vRes.json();
    const newQty = Math.max(0, (vObj.quantity || 0) - qty);
    res = await fetch(`${API}/product_variants/${variantId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...vObj, quantity: newQty }) });
    if (!res.ok) {
      const t = await res.text().catch(()=>'');
      throw new Error('Update variant failed: ' + res.status + ' ' + t);
    }
    const updated = await res.json();
    console.log('Updated variant quantity: ', updated.quantity);

    console.log('Simulated checkout completed successfully.');
  } catch (err) {
    console.error('Simulation failed:', err);
    process.exitCode = 1;
  }
}

main();
