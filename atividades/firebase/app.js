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


const loginForm = document.getElementById("login-form");


loginForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Impede a página de recarregar
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;


  // Método do Firebase para realizar autenticação com e-mail e senha
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Usuário logado com sucesso:", userCredential.user);
      // Redireciona o usuário para o painel administrativo
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("Erro ao fazer login:", error.message);
      alert("Falha ao autenticar. Verifique suas credenciais.");
    });
});
