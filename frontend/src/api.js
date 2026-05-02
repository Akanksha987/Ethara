const API_URL = process.env.REACT_APP_API_URL || 'https://ethara-1-ycpk.onrender.com';

function buildHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function post(path, body, token) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(body)
  });
  return response.json();
}

export async function get(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(token)
  });
  return response.json();
}

export async function put(path, body, token) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(body)
  });
  return response.json();
}
