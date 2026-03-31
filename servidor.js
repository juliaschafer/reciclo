async function fazerLogin() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  console.log('Tentativa de login:', user, pass); // DEBUG

  // Credenciais corretas
  const USER_CORRETO = "adm_escola";
  const PASS_CORRETO = "_unijui_pi_grupo1";

  if (user === USER_CORRETO && pass === PASS_CORRETO) {
    console.log('✅ Login correto!');
    isAdminLogged = true;
    hideLoginModal();
    document.getElementById('public-view').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    document.getElementById('btn-admin').classList.add('hidden');
    document.getElementById('admin-logged').classList.remove('hidden');
    document.getElementById('admin-name').innerText = user;
    atualizarTabelaRegistros();
  } else {
    console.log('❌ Credenciais inválidas. Esperado:', USER_CORRETO, PASS_CORRETO);
    console.log('Recebido:', user, pass);
    alert('❌ Usuário ou senha incorretos!\n\nTente:\nUsuário: adm_escola\nSenha: _unijui_pi_grupo1');
  }
}