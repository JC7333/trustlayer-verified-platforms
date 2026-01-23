# TrustLayer VTC/Livraison - Checklist Pilot Ready

## ✅ Checklist de validation (10 points)

### 1. Création de prestataire

- [ ] Accéder à `/app/providers`
- [ ] Cliquer "Nouveau prestataire"
- [ ] Remplir nom + email
- [ ] Vérifier que le lien magic link est généré

### 2. Copie/envoi du lien

- [ ] Copier le lien dans le presse-papiers
- [ ] Vérifier que le bouton "Email" ouvre le client mail avec le lien

### 3. Portail prestataire mobile

- [ ] Ouvrir le lien `/u/:token` sur mobile
- [ ] Vérifier l'affichage de la liste des 7 documents VTC
- [ ] Vérifier la barre de progression

### 4. Upload de document

- [ ] Prendre une photo ou sélectionner un fichier
- [ ] Vérifier l'upload (toast de succès)
- [ ] Vérifier que la progression se met à jour

### 5. Saisie des dates

- [ ] Pour un document avec expiration, vérifier le modal de dates
- [ ] Entrer une date d'émission et d'expiration
- [ ] Soumettre et vérifier l'enregistrement

### 6. Console de revue

- [ ] Accéder à `/app/review`
- [ ] Voir le document uploadé dans "À traiter"
- [ ] Cliquer pour ouvrir l'aperçu

### 7. Validation de document

- [ ] Cliquer "Valider" sur un document
- [ ] Vérifier le toast de succès
- [ ] Vérifier que le statut passe à "Validé"

### 8. Rejet de document

- [ ] Sélectionner un document
- [ ] Cliquer "Rejeter"
- [ ] Choisir un motif + commentaire
- [ ] Confirmer le rejet

### 9. Export CSV

- [ ] Sur la page Review, cliquer "Export CSV"
- [ ] Vérifier le téléchargement du fichier
- [ ] Ouvrir le CSV et vérifier les 3 sections (prestataires, documents, audit)

### 10. Pack de règles VTC

- [ ] Accéder à `/app/rules`
- [ ] Vérifier l'affichage du pack "VTC / Livraison France"
- [ ] Vérifier les 7 documents (5 obligatoires, 2 optionnels)

---

## 📋 Script de démo (5 minutes)

### Minute 1 : Introduction (0:00 - 1:00)

"Bonjour, je vous présente TrustLayer, la solution de vérification documentaire pour les plateformes VTC et livraison. Notre promesse : réduire de 80% le temps passé sur la conformité et éliminer les risques d'expiration oubliée."

### Minute 2 : Création prestataire (1:00 - 2:00)

_Ouvrir `/app/providers`_
"En 30 secondes, j'invite un nouveau chauffeur. Je saisis son nom et email, et TrustLayer génère un lien sécurisé unique."
_Copier le lien_
"Ce lien est valable 7 jours et ne nécessite aucun compte pour le chauffeur."

### Minute 3 : Portail prestataire (2:00 - 3:00)

_Ouvrir le lien sur mobile_
"Côté chauffeur, l'expérience est ultra-simple : une liste claire des documents requis, la possibilité de prendre une photo directement depuis le téléphone."
_Simuler un upload_
"L'upload prend quelques secondes. Le chauffeur voit sa progression en temps réel."

### Minute 4 : Console de revue (3:00 - 4:00)

_Revenir sur `/app/review`_
"Côté plateforme, vos équipes ont une inbox centralisée. Un clic pour visualiser le document, un clic pour valider ou rejeter avec un motif."
_Valider un document_
"Chaque action est horodatée et tracée pour l'audit."

### Minute 5 : Export & règles (4:00 - 5:00)

_Cliquer Export CSV_
"En cas de contrôle, vous exportez tout l'historique en un clic : prestataires, documents, décisions."
_Montrer `/app/rules`_
"Le pack VTC France est préconfiguré avec les 7 documents réglementaires. Vous êtes opérationnel immédiatement."

**Conclusion :**
"TrustLayer automatise la relance avant expiration et bloque automatiquement les chauffeurs non conformes. Questions ?"

---

## 🚀 URLs de test

| Page                | URL              |
| ------------------- | ---------------- |
| Dashboard           | `/app/dashboard` |
| Prestataires        | `/app/providers` |
| Console de revue    | `/app/review`    |
| Packs de règles     | `/app/rules`     |
| Portail prestataire | `/u/:token`      |

## 📱 Test mobile

Le portail prestataire (`/u/:token`) est optimisé mobile-first. Tester sur :

- iPhone Safari
- Android Chrome
- Différentes tailles d'écran

## 🔐 Sécurité

- ✅ Magic links hashés (SHA-256)
- ✅ Rate limiting sur les endpoints publics
- ✅ URLs signées pour les documents (15 min)
- ✅ RLS strict sur toutes les tables
- ✅ Audit log immutable
