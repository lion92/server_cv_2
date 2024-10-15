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
    const { nom, prenom, adresse, email, telephone, profil, headerColor, textColor, separatorColor } = req.body;

    // Expériences et Formations avec dates de début et fin
    const experienceStartDates = req.body.experienceStartDate || [];
    const experienceEndDates = req.body.experienceEndDate || [];
    const experienceLieux = req.body.experienceLieu || [];
    const experienceDescriptions = req.body.experienceDescription || [];

    const formationStartDates = req.body.formationStartDate || [];
    const formationEndDates = req.body.formationEndDate || [];
    const formationLieux = req.body.formationLieu || [];
    const formationDescriptions = req.body.formationDescription || [];

    // Certifications et Loisirs
    const certifications = req.body.certification || [];
    const loisirs = req.body.loisir || [];

    // Création du PDF avec marges
    const doc = new PDFDocument({ margin: 50 });

    // En-tête pour téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cv-${prenom}-${nom}.pdf`);

    // Pipe vers la réponse HTTP
    doc.pipe(res);

    // Ajouter un cadre coloré en haut (couleur personnalisée)
    doc.rect(0, 0, doc.page.width, 80)
        .fill(headerColor || '#007bff') // Utiliser la couleur choisie pour l'en-tête, ou la valeur par défaut
        .stroke();

    // Texte centré dans l'en-tête
    doc.fillColor('white').fontSize(25).text(`${prenom} ${nom}`, { align: 'center', baseline: 'middle', height: 80 });
    doc.moveDown(1);

    // Informations personnelles sous le cadre
    doc.fillColor(textColor || 'black').fontSize(12).text(`Adresse: ${adresse}`, { align: 'center' });
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
    doc.fontSize(16).fillColor(headerColor || '#007bff').text('Profil professionnel', { underline: true });
    doc.moveDown(1);
    doc.fontSize(12).fillColor(textColor || 'black').text(profil, { align: 'left' });
    doc.moveDown(2);

    // Expériences professionnelles
    doc.fontSize(16).fillColor(headerColor || '#007bff').text('Expériences professionnelles', { underline: true });
    doc.moveDown(1);
    experienceStartDates.forEach((startDate, index) => {
        doc.fontSize(12).fillColor(textColor || 'black').text(`${startDate} - ${experienceEndDates[index]} : ${experienceLieux[index]}`);
        doc.fontSize(12).fillColor(textColor || 'gray').text(experienceDescriptions[index], { indent: 40 });
        doc.moveDown(1);
    });

    // Formations
    doc.fontSize(16).fillColor(headerColor || '#007bff').text('Formations', { underline: true });
    doc.moveDown(1);
    formationStartDates.forEach((startDate, index) => {
        doc.fontSize(12).fillColor(textColor || 'black').text(`${startDate} - ${formationEndDates[index]} : ${formationLieux[index]}`);
        doc.fontSize(12).fillColor(textColor || 'gray').text(formationDescriptions[index], { indent: 40 });
        doc.moveDown(1);
    });

    // Certifications
    if (certifications.length > 0) {
        doc.fontSize(16).fillColor(headerColor || '#007bff').text('Certifications', { underline: true });
        doc.moveDown(1);
        certifications.forEach(cert => {
            doc.fontSize(12).fillColor(textColor || 'black').text(`- ${cert}`);
            doc.moveDown(0.5);
        });
    }

    // Loisirs
    if (loisirs.length > 0) {
        doc.fontSize(16).fillColor(headerColor || '#007bff').text('Loisirs', { underline: true });
        doc.moveDown(1);
        loisirs.forEach(loisir => {
            doc.fontSize(12).fillColor(textColor || 'black').text(`- ${loisir}`);
            doc.moveDown(0.5);
        });
    }

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
