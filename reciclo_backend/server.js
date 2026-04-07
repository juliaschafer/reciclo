// server.js
require('dotenv').config(); // Carrega as variáveis do .env primeiro
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ===== INICIALIZAR FIREBASE COM SEGURANÇA VIA .ENV =====
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://reciclo-23-default-rtdb.firebaseio.com" // URL do seu banco
});

const db = admin.database();

// ===== DADOS DE MATERIAIS ATUALIZADOS =====
const MATERIAIS = {
  "Cobre": 5000,
  "Metal": 1875,
  "Bateria": 313,
  "Motor": 1250,
  "Latinha": 875,
  "Alumínio duro": 750,
  "Panela": 750,
  "Ferro normal": 38,
  "Ferro fundido": 100,
  "Inox": 125,
  "Papelão": 38,
  "PP": 38,
  "Plástico misto": 25,
  "PET misto": 100
};

// ===== ENDPOINT: Registrar Material =====
app.post('/api/registrar', (req, res) => {
  const { serie, material, qtd } = req.body;

  // Validação no servidor (não confia no cliente)
  if (!serie || !material || !qtd) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }
  if (qtd <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser maior que 0' });
  }
  if (MATERIAIS[material] === undefined) {
    return res.status(400).json({ erro: 'Material inválido' });
  }

  // Calcula pontos
  const pontos = Math.round(qtd * MATERIAIS[material]);

  // Salva no Firebase
  db.ref('registros').push({
    data: new Date().toISOString(),
    serie,
    material,
    qtd: parseFloat(qtd),
    pontos
  })
  .then(() => {
    res.json({ sucesso: true, pontos });
  })
  .catch(err => {
    res.status(500).json({ erro: 'Erro ao salvar: ' + err.message });
  });
});

// ===== ENDPOINT: Deletar Registro =====
app.delete('/api/registros/:id', (req, res) => {
  const { id } = req.params;
  
  db.ref('registros/' + id).remove()
    .then(() => {
      res.json({ sucesso: true });
    })
    .catch(err => {
      res.status(500).json({ erro: 'Erro ao deletar: ' + err.message });
    });
});

// ===== ENDPOINT: Obter Ranking =====
app.get('/api/ranking', (req, res) => {
  db.ref('registros').once('value', (snapshot) => {
    const dados = snapshot.val() ? Object.values(snapshot.val()) : [];
    const rank = {};
    
    ['6º ano', '7º ano', '8º ano', '9º ano'].forEach(s => {
      rank[s] = { pts: 0, kg: 0 };
    });

    dados.forEach(d => {
      if (rank[d.serie]) {
        rank[d.serie].pts += d.pontos;
        rank[d.serie].kg += parseFloat(d.qtd);
      }
    });

    const ranking = Object.entries(rank)
      .map(([serie, v]) => ({ serie, pts: v.pts, kg: v.kg }))
      .sort((a, b) => b.pts - a.pts);
      
    res.json(ranking);
  });
});

// ===== INICIAR SERVIDOR =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log("🔥 Firebase inicializado com segurança via .env!");
});