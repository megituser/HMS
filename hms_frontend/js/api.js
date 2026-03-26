// api.js
async function apiRequest(endpoint, method = "GET", body = null) {

  const token = getToken();

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (response.status === 401) {
    logout();
    return;
  }

  return response.json();
}
