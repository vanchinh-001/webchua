const API_URL = "http://localhost:3000"; // URL của json-server

export async function apiGet(endpoint) {
  const res = await fetch(`${API_URL}/${endpoint}`);
  if (!res.ok) throw new Error("Lỗi khi gọi API");
  return await res.json();
}

export async function apiPost(endpoint, data) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Lỗi khi gửi dữ liệu");
  return await res.json();
}

export async function apiPut(endpoint, data) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Lỗi khi cập nhật dữ liệu");
  return await res.json();
}

export async function apiDelete(endpoint) {
  const res = await fetch(`${API_URL}/${endpoint}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Lỗi khi xóa dữ liệu');
  return true;
}
