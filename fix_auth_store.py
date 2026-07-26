path = './src/lib/auth-store.ts'
with open(path, 'r') as f:
    content = f.read()

old_signup = '''export async function signup(
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  if (!username.trim() || !password.trim()) {
    return { success: false, message: "Username and password are required" };
  }

  const res = await fetch(`${API_BASE_URL}/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      data?.username?.[0] || data?.password?.[0] || data?.detail || "Signup failed";
    return { success: false, message };
  }

  return { success: true, message: "Account created successfully" };
}'''

new_signup = '''export async function signup(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  if (!username.trim() || !email.trim() || !password.trim()) {
    return { success: false, message: "Username, email, and password are required" };
  }

  const res = await fetch(`${API_BASE_URL}/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      data?.username?.[0] || data?.email?.[0] || data?.password?.[0] || data?.detail || "Signup failed";
    return { success: false, message };
  }

  return { success: true, message: "Account created successfully" };
}'''

if old_signup not in content:
    print('PATTERN NOT FOUND — aborting, no changes made.')
else:
    content = content.replace(old_signup, new_signup)
    with open(path, 'w') as f:
        f.write(content)
    print('auth-store.ts patched successfully.')
