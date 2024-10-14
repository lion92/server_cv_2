const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const path = require('path');
const multer = require('multer');

// Configurer Multer pour le stockage des images téléchargées
const upload = multer({ dest: 'uploads/' });

// Créer l'application Express
const app = express();

// Utiliser CORS pour autoriser toutes les origines
app.use(cors());

// Middleware pour parser les requêtes JSON et urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques à partir du dossier "public"
app.use('/public', express.static(path.join(__dirname, 'public')));

// Route GET pour servir la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route POST pour générer le PDF
app.post('/generate-cv', upload.single('photo'), (req, res) => {
    const { nom, prenom, adresse, email, experiences, formations, loisirs } = req.body;
    const photo = req.file;  // Récupérer la photo téléchargée

    // Vérifier si les champs sont fournis
    if (!nom || !prenom || !adresse || !email || !experiences || !formations || !loisirs || !photo) {
        return res.status(400).send('Tous les champs sont requis');
    }

    // Créer un nouveau document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurer l'en-tête de réponse pour le fichier PDF
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe le flux PDF dans la réponse
    doc.pipe(res);

    // Couleurs pour le CV
    const primaryColor = '#00796b'; // Vert
    const secondaryColor = '#f4f4f4'; // Gris clair
    const textColor = '#333333'; // Gris foncé

    // Ajouter un fond coloré pour l'en-tête
    doc
        .rect(0, 0, doc.page.width, 100)
        .fill(primaryColor);

    // Ajouter le nom et prénom en haut du CV
    doc
        .fillColor('white')
        .fontSize(30)
        .font('Helvetica-Bold')
        .text(`${prenom} ${nom}`, 50, 30, { align: 'left' });

    // Ajouter l'adresse et l'email sous le nom
    doc
        .fillColor('white')
        .fontSize(14)
        .text(`Adresse : ${adresse}`, 50, 70)
        .text(`Email : ${email}`, 50, 90);

    // Ajouter la photo du CV
    if (photo) {
        doc.image(photo.path, doc.page.width - 150, 30, {
            fit: [100, 100],
            align: 'right',
            valign: 'top'
        });
    }

    // Ajouter une ligne sous l'en-tête
    doc
        .moveTo(50, 110)
        .lineTo(doc.page.width - 50, 110)
        .stroke(primaryColor);

    // Section Expériences
    doc
        .moveDown(2)
        .fillColor(textColor)
        .fontSize(20)
        .text('Expériences professionnelles', { underline: true })
        .moveDown(0.5);
    experiences.split('\n').forEach(exp => {
        doc.fontSize(14).text(`- ${exp}`).moveDown(0.5);
    });

    // Ajouter une séparation entre les sections
    doc
        .moveDown(1)
        .rect(50, doc.y, doc.page.width - 100, 1)
        .fill(primaryColor)
        .moveDown(1);

    // Section Formations
    doc
        .fillColor(textColor)
        .fontSize(20)
        .text('Formations', { underline: true })
        .moveDown(0.5);
    formations.split('\n').forEach(formation => {
        doc.fontSize(14).text(`- ${formation}`).moveDown(0.5);
    });

    // Ajouter une autre séparation
    doc
        .moveDown(1)
        .rect(50, doc.y, doc.page.width - 100, 1)
        .fill(primaryColor)
        .moveDown(1);

    // Section Loisirs
    doc
        .fillColor(textColor)
        .fontSize(20)
        .text('Loisirs', { underline: true })
        .moveDown(0.5);
    doc.fontSize(14).text(loisirs);

    // Finaliser le PDF et l'envoyer
    doc.end();
});

// Démarrer le serveur
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

