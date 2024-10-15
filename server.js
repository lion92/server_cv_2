const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware pour parser les données du formulaire
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configurer Multer pour gérer le téléchargement des photos
const upload = multer({ dest: 'uploads/' });

// Route pour générer le CV en PDF
app.post('/generate-cv', upload.single('photo'), (req, res) => {
    const { nom, prenom, adresse, email, telephone, profil, certifications } = req.body;

    // Expériences et Formations avec dates de début et fin
    const experienceStartDates = req.body.experienceStartDate || [];
    const experienceEndDates = req.body.experienceEndDate || [];
    const experienceLieux = req.body.experienceLieu || [];
    const experienceDescriptions = req.body.experienceDescription || [];

    const formationStartDates = req.body.formationStartDate || [];
    const formationEndDates = req.body.formationEndDate || [];
    const formationLieux = req.body.formationLieu || [];
    const formationDescriptions = req.body.formationDescription || [];

    // Compétences techniques et loisirs (récupérés sous forme de tableau)
    const competences = req.body.competence || [];
    const loisirs = req.body.loisir || [];

    // Création du PDF avec marges
    const doc = new PDFDocument({ margin: 50 });

    // En-tête pour téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=cv-emmanuel-frenot.pdf');

    // Pipe vers la réponse HTTP
    doc.pipe(res);

    // Ajouter un cadre bleu en haut
    doc.rect(0, 0, doc.page.width, 80)
        .fill('#007bff');

    // Bordure autour du CV (liseré)
    const borderWidth = 2;
    doc.rect(borderWidth / 2, borderWidth / 2, doc.page.width - borderWidth, doc.page.height - borderWidth)
        .stroke('#007bff');

    // Texte centré dans le cadre bleu
    doc.fillColor('white').fontSize(25).text(`${prenom} ${nom}`, { align: 'center', baseline: 'middle', height: 80 });
    doc.moveDown(1);

    // Informations personnelles sous le cadre
    doc.fillColor('black').fontSize(12).text(`Adresse: ${adresse}`, { align: 'center' });
    doc.text(`Email: ${email}`, { align: 'center' });
    doc.text(`Téléphone: ${telephone}`, { align: 'center' });

    // Ajouter la photo
    if (req.file) {
        try {
            const imgPath = path.join(__dirname, req.file.path);
            doc.image(imgPath, 450, 100, { width: 100, height: 100 });
        } catch (error) {
            console.error('Erreur avec l\'image :', error);
        }
    }

    doc.moveDown(2);

    // Profil professionnel
    doc.fontSize(16).fillColor('#007bff').text('Profil professionnel', { underline: true });
    doc.moveDown(1);
    doc.fontSize(12).fillColor('black').text(profil, { align: 'left' });
    doc.moveDown(2);

    // Section Expériences Professionnelles avec Dates de Début et Fin
    doc.fontSize(16).fillColor('#007bff').text('Expériences Professionnelles', { underline: true });
    doc.moveDown(1);

    experienceStartDates.forEach((startDate, index) => {
        doc.fontSize(12).fillColor('black').text(`${startDate} - ${experienceEndDates[index]} : ${experienceLieux[index]}`, { bold: true });
        doc.fontSize(12).fillColor('gray').text(experienceDescriptions[index], { indent: 40 });
        doc.moveDown(1);
    });

    // Section Formations avec Dates de Début et Fin
    doc.fontSize(16).fillColor('#007bff').text('Formations', { underline: true });
    doc.moveDown(1);
    formationStartDates.forEach((startDate, index) => {
        doc.fontSize(12).fillColor('black').text(`${startDate} - ${formationEndDates[index]} : ${formationLieux[index]}`, { bold: true });
        doc.fontSize(12).fillColor('gray').text(formationDescriptions[index], { indent: 40 });
        doc.moveDown(1);
    });

    // Section Compétences Techniques
    doc.fontSize(16).fillColor('#007bff').text('Compétences Techniques', { underline: true });
    doc.moveDown(1);
    competences.forEach(competence => {
        doc.fontSize(12).fillColor('black').text(`• ${competence}`);
        doc.moveDown(0.5);
    });

    // Section Certifications
    if (certifications) {
        doc.fontSize(16).fillColor('#007bff').text('Certifications', { underline: true });
        doc.moveDown(1);
        doc.fontSize(12).fillColor('black').text(certifications, { align: 'left' });
    }

    // Section Loisirs
    doc.fontSize(16).fillColor('#007bff').text('Loisirs', { underline: true });
    doc.moveDown(1);
    loisirs.forEach(loisir => {
        doc.fontSize(12).fillColor('black').text(`- ${loisir}`);
        doc.moveDown(0.5);
    });

    // Footer type Bootstrap
    doc.moveDown(2);

    // Terminer et finaliser le PDF
    doc.end();
});

// Démarrer le serveur
const PORT = 3010;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
