

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6dzVVc4k06tvj9cmNf4oJBZfp3qgG3sA",
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


document.addEventListener("DOMContentLoaded", () => {
  console.log("🔍 Página de registro carregada");
  console.log("Firebase disponível?", typeof firebase !== 'undefined');
  
  const registerForm = document.getElementById("register-form");
  
  if (!registerForm) {
    console.error("❌ Formulário não encontrado!");
    return;
  }


  console.log("✅ Formulário encontrado:", registerForm);


  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("📝 Formulário submetido");
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    console.log("📧 Email:", email);
    console.log("🔐 Senha:", password.length + " caracteres");


    // Registrar novo usuário
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("✅ Conta criada com sucesso:", userCredential.user);
        alert("Cadastro realizado! Você será redirecionado para a tela de login.");
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error("❌ Erro ao cadastrar usuário:", error.code, error.message);
        alert("Erro ao realizar cadastro: " + error.message);
      });
  });
});
