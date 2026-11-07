// Firebase configuration
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "dashboard-25794.firebaseapp.com",
  projectId: "dashboard-25794",
  storageBucket: "dashboard-25794.firebasestorage.app",
  messagingSenderId: "868616785289",
  appId: "1:868616785289:web:66b707ed043413bc03e558",
  measurementId: "G-RWLMER5JV7"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();


// Observador ativo: Monitora em tempo real se o usuário está logado ou não
auth.onAuthStateChanged((user) => {
  if (user) {
    // Se existir um usuário autenticado, exibe suas informações na tela
    document.getElementById('user-info').textContent = `Logado como: ${user.email}`;
  } else {
    // Se não houver usuário logado, expulsa o acesso de volta para a página inicial
    console.log("Acesso não autorizado. Redirecionando...");
    window.location.href = 'index.html';
  }
});


// Lógica de encerramento de sessão (Logout)
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      console.log("Sessão encerrada com sucesso.");
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error("Erro ao desconectar:", error.message);
    });
});
